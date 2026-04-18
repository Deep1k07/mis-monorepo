import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Application,
  ApplicationDocument,
} from '../application/schema/application.schema';
import { Entity } from '../entity/schema/entity.schema';
import {
  CertificationStandard,
  CertificationStandardDocument,
} from '../certificationbody/schema/certificationStandards.schema';
import {
  SurveillanceOne,
  SurveillanceOneDocument,
} from '../surveillance/schema/surveillanceOne.schema';
import {
  SurveillanceTwo,
  SurveillanceTwoDocument,
} from '../surveillance/schema/surveillanceTwo.schema';
import {
  CertificateType,
  generateCertificateNumber,
} from './utils/generate-certificate-number';
import { S3Service } from './s3.service';
import * as puppeteer from 'puppeteer';
import * as fs from 'node:fs';
import * as path from 'node:path';

type CertificateMode = 'draft' | 'final';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);
  private readonly draftTemplatePath: string;
  private readonly finalTemplatePath: string;
  private readonly annexureTemplatePath: string;

  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(Entity.name)
    private readonly entityModel: Model<Entity>, // needed for module registration
    @InjectModel(CertificationStandard.name)
    private readonly certificationStandardModel: Model<CertificationStandardDocument>,
    @InjectModel(SurveillanceOne.name)
    private readonly surveillanceOneModel: Model<SurveillanceOneDocument>,
    @InjectModel(SurveillanceTwo.name)
    private readonly surveillanceTwoModel: Model<SurveillanceTwoDocument>,
    private readonly s3Service: S3Service,
  ) {
    this.draftTemplatePath = path.resolve(__dirname, 'templates', 'draft.html');
    this.finalTemplatePath = path.resolve(__dirname, 'templates', 'final.html');
    this.annexureTemplatePath = path.resolve(
      __dirname,
      'templates',
      'annexure.html',
    );
  }

  private buildS3Key(name: string, type: string): string {
    return `certificates/${name}-${type}-${Date.now()}.pdf`;
  }

  async generateDraftCertificate(applicationId: string): Promise<string> {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('entity')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const entity = application.entity as any;
    if (!entity) {
      throw new NotFoundException('Entity not found for this application');
    }

    const mainHtml = this.buildCertificateHtml(application, entity, 'draft');
    const s3Key = this.buildS3Key(`draft-certificate-${applicationId}`, 'draft');

    const [mainS3Key, annexureS3Key] = await Promise.all([
      this.generatePdfFromHtml(mainHtml).then(async (pdfBuffer) => {
        await this.s3Service.upload(pdfBuffer, s3Key, 'application/pdf');
        this.logger.log(
          `Draft certificate uploaded to S3 for application ${applicationId}: ${s3Key}`,
        );
        return s3Key;
      }),
      application.annexure
        ? this.generateAnnexurePdf(application, entity, 'draft', applicationId)
        : Promise.resolve(''),
    ]);

    const version = String(
      (application.draftCertificate?.length || 0) + 1,
    );

    // Mark every existing draft inactive before pushing the new active one
    // so only the most recently generated draft has status: 'active'.
    await this.applicationModel.updateOne(
      { _id: applicationId, 'draftCertificate.0': { $exists: true } },
      { $set: { 'draftCertificate.$[].status': 'inactive' } },
    );

    await this.applicationModel.findByIdAndUpdate(applicationId, {
      $push: {
        draftCertificate: {
          version,
          status: 'active',
          type: 'normal',
          languages: {
            [application.primary_certificate_language || 'en']: {
              s3DraftPdfxUrl: mainS3Key,
              s3DraftDocxUrl: '',
              s3DraftAnnexureDocxUrl: '',
              s3DraftAnnexurePdfxUrl: annexureS3Key,
            },
          },
        },
      },
    });

    return mainS3Key;
  }

  async generateSurveillanceDraftCertificate(
    type: 'first' | 'second',
    surveillanceId: string,
  ): Promise<string> {
    const model: Model<any> =
      type === 'second' ? this.surveillanceTwoModel : this.surveillanceOneModel;

    const surveillance = await model
      .findById(surveillanceId)
      .populate('entity')
      .exec();

    if (!surveillance) {
      throw new NotFoundException('Surveillance record not found');
    }

    const entity = surveillance.entity as any;
    if (!entity) {
      throw new NotFoundException('Entity not found for this surveillance');
    }

    const mainHtml = this.buildCertificateHtml(surveillance, entity, 'draft');
    const s3Key = this.buildS3Key(`draft-surveillance-${type}-${surveillanceId}`, 'draft');

    const [mainS3Key, annexureS3Key] = await Promise.all([
      this.generatePdfFromHtml(mainHtml).then(async (pdfBuffer) => {
        await this.s3Service.upload(pdfBuffer, s3Key, 'application/pdf');
        this.logger.log(
          `Draft surveillance (${type}) certificate uploaded to S3 for ${surveillanceId}: ${s3Key}`,
        );
        return s3Key;
      }),
      surveillance.annexure
        ? this.generateAnnexurePdf(
            surveillance,
            entity,
            'draft',
            surveillanceId,
          )
        : Promise.resolve(''),
    ]);

    const version = String((surveillance.draftCertificate?.length || 0) + 1);

    await model.updateOne(
      { _id: surveillanceId, 'draftCertificate.0': { $exists: true } },
      { $set: { 'draftCertificate.$[].status': 'inactive' } },
    );

    await model.findByIdAndUpdate(surveillanceId, {
      $push: {
        draftCertificate: {
          version,
          status: 'active',
          type: 'normal',
          languages: {
            [surveillance.primary_certificate_language || 'en']: {
              s3DraftPdfxUrl: mainS3Key,
              s3DraftDocxUrl: '',
              s3DraftAnnexureDocxUrl: '',
              s3DraftAnnexurePdfxUrl: annexureS3Key,
            },
          },
        },
      },
    });

    return mainS3Key;
  }

  async generateFinalCertificate(applicationId: string): Promise<string> {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('entity')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const entity = application.entity as any;
    if (!entity) {
      throw new NotFoundException('Entity not found for this application');
    }

    const primaryStandard = application.standards?.[0];
    if (!primaryStandard) {
      throw new NotFoundException(
        'Application has no standards; cannot generate certificate number',
      );
    }

    const standardDoc = await this.certificationStandardModel
      .findOne({ standardCode: primaryStandard.code })
      .lean();
    const mssCode = standardDoc?.mssCode || '';
    if (!mssCode) {
      this.logger.warn(
        `mssCode not found for standardCode "${primaryStandard.code}"; certificate number will omit it`,
      );
    }

    const country =
      application.main_site_address?.[0]?.country ??
      entity.main_site_address?.[0]?.country;
    const computed = generateCertificateNumber(
      {
        entity_id: application.entity_id || entity.entity_id,
        cab_code: application.cab_code,
        type: application.type as CertificateType,
        valid_until: application.valid_until,
        newCertificateNo: application.certificate_number || undefined,
      },
      country,
      mssCode,
    );

    // Persist the computed certificate metadata onto the application so it
    // renders in lists and stays available for subsequent regenerations.
    await this.applicationModel.updateOne(
      { _id: applicationId },
      {
        $set: {
          certificate_number: computed.certificationNumber,
          initial_issue: application.initial_issue || computed.curr_date,
          current_issue: computed.curr_date,
          valid_until: computed.expiryDate,
          first_surveillance: computed.firstSurvalance,
          second_surveillance: computed.secondSurvalance,
          recertification_due: computed.rec,
          issue_no: application.issue_no || '01',
          revision_no: application.revision_no || '00',
          finalCreatedAt: application.finalCreatedAt || new Date(),
          finalUpdatedAt: new Date(),
        },
      },
    );

    // Re-read so the rendered HTML reflects the persisted values.
    const updatedApplication = await this.applicationModel
      .findById(applicationId)
      .populate('entity')
      .exec();
    const updatedEntity = updatedApplication!.entity as any;

    const mainHtml = this.buildCertificateHtml(
      updatedApplication,
      updatedEntity,
      'final',
    );
    const s3Key = this.buildS3Key(`final-certificate-${applicationId}`, 'final');

    const [mainS3Key, annexureS3Key] = await Promise.all([
      this.generatePdfFromHtml(mainHtml).then(async (pdfBuffer) => {
        await this.s3Service.upload(pdfBuffer, s3Key, 'application/pdf');
        this.logger.log(
          `Final certificate uploaded to S3 for application ${applicationId}: ${s3Key}`,
        );
        return s3Key;
      }),
      updatedApplication!.annexure
        ? this.generateAnnexurePdf(
            updatedApplication,
            updatedEntity,
            'final',
            applicationId,
          )
        : Promise.resolve(''),
    ]);

    const version = String(
      (updatedApplication!.finalCertificate?.length || 0) + 1,
    );

    // Mark every existing final certificate inactive before pushing the new one.
    await this.applicationModel.updateOne(
      { _id: applicationId, 'finalCertificate.0': { $exists: true } },
      { $set: { 'finalCertificate.$[].status': 'inactive' } },
    );

    await this.applicationModel.findByIdAndUpdate(applicationId, {
      $push: {
        finalCertificate: {
          version,
          status: 'active',
          type: 'normal',
          languages: {
            [updatedApplication!.primary_certificate_language || 'en']: {
              s3CertificatePdfxUrl: mainS3Key,
              s3CertificateDocxUrl: '',
              s3CertificateAnnexureDocxUrl: '',
              s3CertificateAnnexurePdfxUrl: annexureS3Key,
            },
          },
        },
      },
    });

    return mainS3Key;
  }

  async generateSurveillanceFinalCertificate(
    type: 'first' | 'second',
    surveillanceId: string,
  ): Promise<string> {
    const model: Model<any> =
      type === 'second' ? this.surveillanceTwoModel : this.surveillanceOneModel;

    const surveillance = await model
      .findById(surveillanceId)
      .populate('entity')
      .exec();

    if (!surveillance) {
      throw new NotFoundException('Surveillance record not found');
    }

    const entity = surveillance.entity as any;
    if (!entity) {
      throw new NotFoundException('Entity not found for this surveillance');
    }

    const primaryStandard = surveillance.standards?.[0];
    if (!primaryStandard) {
      throw new NotFoundException(
        'Surveillance has no standards; cannot generate certificate number',
      );
    }

    const standardDoc = await this.certificationStandardModel
      .findOne({ standardCode: primaryStandard.code })
      .lean();
    const mssCode = standardDoc?.mssCode || '';
    if (!mssCode) {
      this.logger.warn(
        `mssCode not found for standardCode "${primaryStandard.code}"; certificate number will omit it`,
      );
    }

    const country =
      surveillance.main_site_address?.[0]?.country ??
      entity.main_site_address?.[0]?.country;
    const computed = generateCertificateNumber(
      {
        entity_id: surveillance.entity_id || entity.entity_id,
        cab_code: surveillance.cab_code,
        type: surveillance.type as CertificateType,
        valid_until: surveillance.valid_until,
        newCertificateNo: surveillance.certificate_number || undefined,
      },
      country,
      mssCode,
    );

    await model.updateOne(
      { _id: surveillanceId },
      {
        $set: {
          certificate_number: computed.certificationNumber,
          initial_issue: surveillance.initial_issue || computed.curr_date,
          current_issue: computed.curr_date,
          valid_until: computed.expiryDate,
          first_surveillance: computed.firstSurvalance,
          second_surveillance: computed.secondSurvalance,
          recertification_due: computed.rec,
          issue_no: surveillance.issue_no || '01',
          revision_no: surveillance.revision_no || '00',
          finalCreatedAt: surveillance.finalCreatedAt || new Date(),
          finalUpdatedAt: new Date(),
        },
      },
    );

    const updatedSurveillance = await model
      .findById(surveillanceId)
      .populate('entity')
      .exec();
    const updatedEntity = updatedSurveillance!.entity as any;

    const mainHtml = this.buildCertificateHtml(
      updatedSurveillance,
      updatedEntity,
      'final',
    );
    const s3Key = this.buildS3Key(`final-surveillance-${type}-${surveillanceId}`, 'final');

    const [mainS3Key, annexureS3Key] = await Promise.all([
      this.generatePdfFromHtml(mainHtml).then(async (pdfBuffer) => {
        await this.s3Service.upload(pdfBuffer, s3Key, 'application/pdf');
        this.logger.log(
          `Final surveillance (${type}) certificate uploaded to S3 for ${surveillanceId}: ${s3Key}`,
        );
        return s3Key;
      }),
      updatedSurveillance!.annexure
        ? this.generateAnnexurePdf(
            updatedSurveillance,
            updatedEntity,
            'final',
            surveillanceId,
          )
        : Promise.resolve(''),
    ]);

    const version = String(
      (updatedSurveillance!.finalCertificate?.length || 0) + 1,
    );

    await model.updateOne(
      { _id: surveillanceId, 'finalCertificate.0': { $exists: true } },
      { $set: { 'finalCertificate.$[].status': 'inactive' } },
    );

    await model.findByIdAndUpdate(surveillanceId, {
      $push: {
        finalCertificate: {
          version,
          status: 'active',
          type: 'normal',
          languages: {
            [updatedSurveillance!.primary_certificate_language || 'en']: {
              s3CertificatePdfxUrl: mainS3Key,
              s3CertificateDocxUrl: '',
              s3CertificateAnnexureDocxUrl: '',
              s3CertificateAnnexurePdfxUrl: annexureS3Key,
            },
          },
        },
      },
    });

    return mainS3Key;
  }

  private buildCertificateHtml(
    application: any,
    entity: any,
    mode: CertificateMode,
  ): string {
    const templatePath =
      mode === 'final' ? this.finalTemplatePath : this.draftTemplatePath;
    let template = fs.readFileSync(templatePath, 'utf-8');

    // Pick background image based on cab_code (e.g. TCU.png, TSI.png, GAU.png, GAI.png)
    const cabCode = (application.cab_code || '').toUpperCase();
    const draftTemplatesDir = path.resolve(
      process.cwd(),
      'src',
      'certificate',
      'templates',
      'darft',
    );
    const cabBgPath = path.join(draftTemplatesDir, `${cabCode}.png`);
    const fallbackBgPath = path.resolve(
      process.cwd(),
      'src',
      'certificate',
      'templates',
      'draft-bg.png',
    );
    const bgImagePath = fs.existsSync(cabBgPath) ? cabBgPath : fallbackBgPath;

    let backgroundImage = '';
    if (fs.existsSync(bgImagePath)) {
      const bgBuffer = fs.readFileSync(bgImagePath);
      backgroundImage = `data:image/png;base64,${bgBuffer.toString('base64')}`;
      this.logger.log(
        `Using certificate background: ${path.basename(bgImagePath)} (cab_code: ${cabCode})`,
      );
    } else {
      this.logger.warn(
        `Certificate background image not found at ${bgImagePath}`,
      );
    }

    // Entity Name
    const entityName = application.entity_name || entity?.entity_name || '';

    // Main Site Address
    const mainAddress = this.formatAddress(
      application.main_site_address?.[0] ?? entity?.main_site_address?.[0],
    );

    // Additional Site Addresses
    const additionalAddressesHtml = this.buildAdditionalAddressesSection(
      application.additional_site_address ?? entity?.additional_site_address,
    );

    // Standard names for the certify text (e.g. "Quality Management System")
    const standardNamesText = (application.standards || [])
      .map((s: { code: string; name: string }) => s.name)
      .join(' & ');

    // Standards section - each standard on its own line: code bold + (name)
    const standardsHtml = this.buildStandardsSection(
      application.standards || [],
    );

    // Scope — when annexure is true, the main certificate shows "Annexure 1"
    // and the real scope text is rendered in the separate annexure PDF.
    const scope = application.annexure
      ? 'Annexure 1'
      : application.scope || '';

    // Draft: always show XXXXXXXXXX for table fields (dates, cert number, etc.)
    // so they never leak real values into a draft certificate.
    // Final: fill every cell with the real persisted value.
    const placeholder = 'XXXXXXXXXX';

    const certificateNumber = mode === 'final' ? (application.certificate_number ?? '') : placeholder;
    const initialIssue = mode === 'final' ? (application.initial_issue ?? '') : placeholder;
    const currentIssue = mode === 'final' ? (application.current_issue ?? '') : placeholder;
    const validUntil = mode === 'final' ? (application.valid_until ?? '') : placeholder;
    const firstSurveillance = mode === 'final' ? (application.first_surveillance ?? '') : placeholder;
    const secondSurveillance = mode === 'final' ? (application.second_surveillance ?? '') : placeholder;
    const recertificationDue = mode === 'final' ? (application.recertification_due ?? '') : placeholder;
    const revisionNo = mode === 'final' ? (application.revision_no ?? '') : placeholder;
    const issueNo = mode === 'final' ? (application.issue_no ?? '') : placeholder;
    const iafCode = mode === 'final' ? (application.iaf_code ?? '') : placeholder;

    // Bottom section
    const audit1 = application.audit1 || '';
    const audit2 = application.audit2 || '';
    const auditorLeaderName = application.auditor_leader_name || '';

    // Dynamic font sizes based on content length
    const entityNameFontSize = this.calcFontSize(entityName.length, {
      max: 30,
      min: 14,
      shrinkAfter: 25,
      charsPerStep: 10,
      stepSize: 2,
    });
    const scopeFontSize = this.calcFontSize(scope.length, {
      max: 18,
      min: 9,
      shrinkAfter: 60,
      charsPerStep: 25,
      stepSize: 1,
    });

    // Replace all placeholders
    template = template.replace(
      '{{ENTITY_NAME_FONT_SIZE}}',
      `${entityNameFontSize}px`,
    );
    template = template.replace('{{SCOPE_FONT_SIZE}}', `${scopeFontSize}px`);
    template = template.replace('{{BACKGROUND_IMAGE}}', backgroundImage);
    template = template.replace(
      '{{STANDARD_NAMES_TEXT}}',
      this.escapeHtml(standardNamesText),
    );
    template = template.replace('{{ENTITY_NAME}}', this.escapeHtml(entityName));
    template = template.replace(
      '{{MAIN_SITE_ADDRESS}}',
      this.escapeHtml(mainAddress),
    );
    template = template.replace(
      '{{ADDITIONAL_SITE_ADDRESSES_SECTION}}',
      additionalAddressesHtml,
    );
    template = template.replace('{{STANDARDS_SECTION}}', standardsHtml);
    template = template.replace('{{SCOPE}}', this.escapeHtml(scope));
    template = template.replace(
      '{{CERTIFICATE_NUMBER}}',
      this.escapeHtml(certificateNumber),
    );
    template = template.replace(
      '{{INITIAL_ISSUE}}',
      this.escapeHtml(initialIssue),
    );
    template = template.replace(
      '{{CURRENT_ISSUE}}',
      this.escapeHtml(currentIssue),
    );
    template = template.replace(
      '{{VALID_UNTIL}}',
      this.escapeHtml(validUntil),
    );
    template = template.replace(
      '{{FIRST_SURVEILLANCE}}',
      this.escapeHtml(firstSurveillance),
    );
    template = template.replace(
      '{{SECOND_SURVEILLANCE}}',
      this.escapeHtml(secondSurveillance),
    );
    template = template.replace(
      '{{RECERTIFICATION_DUE}}',
      this.escapeHtml(recertificationDue),
    );
    template = template.replace(
      '{{REVISION_NO}}',
      this.escapeHtml(revisionNo),
    );
    template = template.replace('{{ISSUE_NO}}', this.escapeHtml(issueNo));
    template = template.replace('{{IAF_CODE}}', this.escapeHtml(iafCode));
    template = template.replace('{{AUDIT1}}', this.escapeHtml(audit1));
    template = template.replace('{{AUDIT2}}', this.escapeHtml(audit2));
    template = template.replace(
      '{{AUDITOR_LEADER_NAME}}',
      this.escapeHtml(auditorLeaderName),
    );

    return template;
  }

  private async generateAnnexurePdf(
    application: any,
    entity: any,
    mode: CertificateMode,
    applicationId: string,
  ): Promise<string> {
    const html = this.buildAnnexureHtml(application, entity, mode);
    const pdfBuffer = await this.generatePdfFromHtml(html);

    const prefix = mode === 'final' ? 'final' : 'draft';
    const s3Key = this.buildS3Key(`${prefix}-annexure-${applicationId}`, prefix);
    await this.s3Service.upload(pdfBuffer, s3Key, 'application/pdf');

    this.logger.log(
      `${mode === 'final' ? 'Final' : 'Draft'} annexure uploaded to S3 for ${applicationId}: ${s3Key}`,
    );

    return s3Key;
  }

  private buildAnnexureHtml(
    application: any,
    entity: any,
    mode: CertificateMode,
  ): string {
    let template = fs.readFileSync(this.annexureTemplatePath, 'utf-8');

    const annexureBgPath = path.resolve(
      process.cwd(),
      'src',
      'certificate',
      'templates',
      'darft',
      'Annexure.png',
    );
    let backgroundImage = '';
    if (fs.existsSync(annexureBgPath)) {
      const bgBuffer = fs.readFileSync(annexureBgPath);
      backgroundImage = `data:image/png;base64,${bgBuffer.toString('base64')}`;
    } else {
      this.logger.warn(
        `Annexure background image not found at ${annexureBgPath}`,
      );
    }

    const scope = application.scope || '';
    const entityName = application.entity_name || entity?.entity_name || '';
    const certificateNumber =
      mode === 'final' ? (application.certificate_number ?? '') : 'XXXXXXXXXX';

    const scopeFontSize = this.calcFontSize(scope.length, {
      max: 16,
      min: 10,
      shrinkAfter: 500,
      charsPerStep: 300,
      stepSize: 1,
    });
    const watermark =
      mode === 'draft'
        ? '<div class="draft-watermark">Draft copy must be returned within 15 days</div>'
        : '';

    template = template.replace('{{BACKGROUND_IMAGE}}', backgroundImage);
    template = template.replace('{{WATERMARK}}', watermark);
    template = template.replace('{{ENTITY_NAME}}', this.escapeHtml(entityName));
    template = template.replace(
      '{{CERTIFICATE_NUMBER}}',
      this.escapeHtml(certificateNumber),
    );
    template = template.replace('{{SCOPE_FONT_SIZE}}', `${scopeFontSize}px`);
    template = template.replace('{{SCOPE}}', this.escapeHtml(scope));

    return template;
  }

  private buildStandardsSection(
    standards: { code: string; name: string }[],
  ): string {
    if (!standards || standards.length === 0) return '';

    return standards
      .map(
        (s) =>
          `<p class="standard-code">${this.escapeHtml(s.code)}</p>
       <p class="standard-name">(${this.escapeHtml(s.name)})</p>`,
      )
      .join('');
  }

  private buildAdditionalAddressesSection(
    additionalAddresses: any[],
  ): string {
    if (!additionalAddresses || additionalAddresses.length === 0) {
      return '';
    }

    return additionalAddresses
      .map((addr, index) => {
        const formatted = this.formatAddress(addr);
        return `<p class="address-text">${this.escapeHtml(formatted)}</p>`;
      })
      .join('');
  }

  private formatAddress(addr: any): string {
    if (!addr) return '';
    const parts = [
      addr.street,
      addr.city,
      addr.state,
      addr.country,
      addr.postal_code,
    ].filter(Boolean);
    return parts.join(', ');
  }

  private calcFontSize(
    length: number,
    opts: {
      max: number;
      min: number;
      shrinkAfter: number;
      charsPerStep: number;
      stepSize: number;
    },
  ): number {
    if (length <= opts.shrinkAfter) return opts.max;
    const overflow = length - opts.shrinkAfter;
    const steps = Math.ceil(overflow / opts.charsPerStep);
    return Math.max(opts.min, opts.max - steps * opts.stepSize);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private async generatePdfFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfUint8Array = await page.pdf({
        width: '794px',
        height: '1123px',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      return Buffer.from(pdfUint8Array);
    } finally {
      await browser.close();
    }
  }
}

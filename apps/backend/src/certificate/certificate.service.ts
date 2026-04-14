import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Application,
  ApplicationDocument,
} from '../application/schema/application.schema';
import { Entity } from '../entity/schema/entity.schema';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);
  private readonly templatePath: string;
  private readonly outputDir: string;

  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(Entity.name)
    private readonly entityModel: Model<Entity>, // needed for module registration
  ) {
    this.templatePath = path.resolve(
      __dirname,
      'templates',
      'draft.html',
    );
    this.outputDir = path.resolve(process.cwd(), 'generated-certificates');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
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

    const html = this.buildCertificateHtml(application, entity);
    const pdfBuffer = await this.generatePdfFromHtml(html);

    const fileName = `draft-certificate-${applicationId}-${Date.now()}.pdf`;
    const filePath = path.join(this.outputDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    this.logger.log(
      `Draft certificate generated for application ${applicationId}: ${filePath}`,
    );

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
              s3DraftPdfxUrl: filePath,
              s3DraftDocxUrl: '',
              s3DraftAnnexureDocxUrl: '',
              s3DraftAnnexurePdfxUrl: '',
            },
          },
        },
      },
    });

    return filePath;
  }

  private buildCertificateHtml(application: any, entity: any): string {
    let template = fs.readFileSync(this.templatePath, 'utf-8');

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
    const entityName = entity.entity_name || '';

    // Main Site Address
    const mainAddress = this.formatAddress(entity.main_site_address?.[0]);

    // Additional Site Addresses
    const additionalAddressesHtml = this.buildAdditionalAddressesSection(
      entity.additional_site_address,
    );

    // Standard names for the certify text (e.g. "Quality Management System")
    const standardNamesText = (application.standards || [])
      .map((s: { code: string; name: string }) => s.name)
      .join(' & ');

    // Standards section - each standard on its own line: code bold + (name)
    const standardsHtml = this.buildStandardsSection(
      application.standards || [],
    );

    // Scope
    const scope = application.scope || '';

    // Draft certificate: show XXXXXXXXXX for all table values
    // except IAF code and revision no which may have real values
    const placeholder = 'XXXXXXXXXX';
    const certificateNumber = placeholder;
    const initialIssue = placeholder;
    const currentIssue = placeholder;
    const validUntil = placeholder;
    const firstSurveillance = placeholder;
    const secondSurveillance = placeholder;
    const recertificationDue = placeholder;
    const revisionNo = application.revision_no || placeholder;
    const issueNo = placeholder;
    const iafCode = application.iaf_code || placeholder;

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

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CertificateService } from './certificate.service';

export const DRAFT_APPROVED_EVENT = 'application.draft.approved';
export const FINAL_APPROVED_EVENT = 'application.final.approved';

export interface DraftApprovedPayload {
  applicationId: string;
}

export interface FinalApprovedPayload {
  applicationId: string;
}

@Injectable()
export class CertificateEventListener {
  private readonly logger = new Logger(CertificateEventListener.name);

  constructor(private readonly certificateService: CertificateService) {}

  @OnEvent(DRAFT_APPROVED_EVENT)
  async handleDraftApproved(payload: DraftApprovedPayload) {
    this.logger.log(
      `Draft approved event received for application: ${payload.applicationId}`,
    );

    try {
      const filePath =
        await this.certificateService.generateDraftCertificate(
          payload.applicationId,
        );
      this.logger.log(`Draft certificate generated at: ${filePath}`);
    } catch (error) {
      this.logger.error(
        `Failed to generate draft certificate for application ${payload.applicationId}`,
        error.stack,
      );
    }
  }

  @OnEvent(FINAL_APPROVED_EVENT)
  async handleFinalApproved(payload: FinalApprovedPayload) {
    this.logger.log(
      `Final approved event received for application: ${payload.applicationId}`,
    );

    try {
      const filePath =
        await this.certificateService.generateFinalCertificate(
          payload.applicationId,
        );
      this.logger.log(`Final certificate generated at: ${filePath}`);
    } catch (error) {
      this.logger.error(
        `Failed to generate final certificate for application ${payload.applicationId}`,
        error.stack,
      );
    }
  }
}

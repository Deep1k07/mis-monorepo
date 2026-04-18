"use client";

import { useState } from "react";
import { FileDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCertificatePresignedUrl } from "@/utils/mutations";
import toast from "react-hot-toast";

function getActiveCertificate(certificates: any[] | undefined) {
  if (!certificates || certificates.length === 0) return null;
  return certificates.find((c: any) => c.status === "active") || null;
}

function getS3Key(cert: any, field: string): string | null {
  if (!cert?.languages) return null;
  const langs = cert.languages;
  // languages is a Map-like object; get the first language entry
  const langKey = typeof langs === "object" ? Object.keys(langs)[0] : null;
  if (!langKey) return null;
  const langData = langs[langKey] || langs.get?.(langKey);
  if (!langData) return null;
  const value = langData[field];
  return value && value.length > 0 ? value : null;
}

function CertButton({
  label,
  s3Key,
}: {
  label: string;
  s3Key: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const url = await getCertificatePresignedUrl(s3Key);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Failed to get certificate URL");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <FileDown className="h-4 w-4 mr-2 animate-pulse" />
      ) : (
        <ExternalLink className="h-4 w-4 mr-2" />
      )}
      {loading ? "Loading..." : label}
    </Button>
  );
}

export function CertificateLinks({
  draftCertificates,
  finalCertificates,
}: {
  draftCertificates?: any[];
  finalCertificates?: any[];
}) {
  const activeDraft = getActiveCertificate(draftCertificates);
  const activeFinal = getActiveCertificate(finalCertificates);

  const draftPdfKey = getS3Key(activeDraft, "s3DraftPdfxUrl");
  const draftAnnexureKey = getS3Key(activeDraft, "s3DraftAnnexurePdfxUrl");
  const finalPdfKey = getS3Key(activeFinal, "s3CertificatePdfxUrl");
  const finalAnnexureKey = getS3Key(activeFinal, "s3CertificateAnnexurePdfxUrl");

  if (!draftPdfKey && !finalPdfKey) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold mb-3">Certificates</h4>
      <div className="flex flex-col gap-3 p-3 bg-muted/40 rounded-lg">
        {draftPdfKey && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground w-28">
              Draft Certificate
            </span>
            <CertButton label="View PDF" s3Key={draftPdfKey} />
            {draftAnnexureKey && (
              <CertButton label="View Annexure" s3Key={draftAnnexureKey} />
            )}
            {activeDraft?.version && (
              <span className="text-xs text-muted-foreground">
                v{activeDraft.version}
              </span>
            )}
          </div>
        )}
        {finalPdfKey && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground w-28">
              Final Certificate
            </span>
            <CertButton label="View PDF" s3Key={finalPdfKey} />
            {finalAnnexureKey && (
              <CertButton label="View Annexure" s3Key={finalAnnexureKey} />
            )}
            {activeFinal?.version && (
              <span className="text-xs text-muted-foreground">
                v{activeFinal.version}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import saturnLogo from "@assets/generated_images/pure_aqua_saturn_planet_on_transparency.png";

interface LetterheadProps {
  withAddress?: boolean;
  company?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export function ORBITLetterhead({ 
  withAddress = true,
  company = {
    name: "ORBIT Staffing OS",
    address: "Tech Hub, United States",
    phone: "(555) 000-ORBIT",
    email: "support@orbitstaffing.net"
  }
}: LetterheadProps) {
  return (
    <div className="w-full border-b-2 border-cyan-500/30 pb-6 mb-6">
      {/* Logo & Title */}
      <div className="flex items-center gap-4 mb-4">
        <img src={saturnLogo} alt="ORBIT" className="w-12 h-12" />
        <div>
          <h1 className="text-2xl font-bold text-cyan-300">ORBIT</h1>
          <p className="text-sm text-slate-400">Staffing OS</p>
        </div>
      </div>

      {/* Company Info */}
      {withAddress && (
        <div className="space-y-1 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">{company.name}</p>
          <p>{company.address}</p>
          <p>{company.phone} | {company.email}</p>
        </div>
      )}

      {/* Leadership */}
      <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-slate-400">CEO & Owner</p>
          <p className="font-semibold text-slate-200">Jason Summers</p>
        </div>
        <div>
          <p className="text-slate-400">Chief Operating Officer</p>
          <p className="font-semibold text-slate-200">Sedonia Summers</p>
        </div>
      </div>
    </div>
  );
}

export function WelcomeLetter({
  recipientName,
  role,
  letterBody,
  signature = true,
}: {
  recipientName: string;
  role: "employee" | "owner" | "admin";
  letterBody: string;
  signature?: boolean;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white text-black p-8 rounded-lg shadow-lg max-w-2xl mx-auto font-serif">
      {/* Letterhead */}
      <ORBITLetterhead />

      {/* Date */}
      <p className="text-sm text-slate-600 mb-6">{today}</p>

      {/* Greeting */}
      <p className="mb-6">Dear {recipientName},</p>

      {/* Body */}
      <div className="mb-8 space-y-4 text-sm leading-relaxed whitespace-pre-wrap">
        {letterBody}
      </div>

      {/* Signature */}
      {signature && (
        <div className="mt-12">
          <p className="text-sm mb-8">Sincerely,</p>
          <div className="space-y-1">
            <p className="font-bold">
              {role === "employee" || role === "owner" ? "Sedonia Summers" : "Jason Summers"}
            </p>
            <p className="text-sm text-slate-600">
              {role === "employee" || role === "owner" 
                ? "Chief Operating Officer" 
                : "CEO & Owner"}
            </p>
            <p className="text-xs text-slate-500 pt-2">ORBIT Staffing OS</p>
          </div>
        </div>
      )}

      {/* Hallmark */}
      <div className="mt-12 pt-4 border-t border-slate-300 text-xs text-center text-slate-500">
        <p>Powered by ORBIT | Unique Asset ID: {generateAssetId()}</p>
      </div>
    </div>
  );
}

function generateAssetId(): string {
  return "ORBIT-" + Date.now().toString(36).toUpperCase();
}

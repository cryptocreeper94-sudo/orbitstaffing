import React, { useState } from 'react';
import { Check, Shield, Copy, Zap, FileText, CreditCard, Mail, Handshake, Camera, ClipboardList, Briefcase, Users, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HallmarkWatermark, HallmarkPageWatermark } from '@/components/HallmarkWatermark';
import { DigitalEmployeeCard } from '@/components/DigitalEmployeeCard';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail } from '@/components/ui/carousel-rail';
import { PageHeader, SectionHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent } from '@/components/ui/orbit-card';

export default function DigitalHallmark() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'watermark' | 'employee-card'>('watermark');

  const worker = {
    id: 'WRK-2024-45892',
    employeeNumber: 'EMP-0892',
    name: 'John Michael Rodriguez',
    verificationCode: 'ORBIT-XK9M2Q7W8P',
    status: 'verified',
    issuedDate: '2024-11-15',
    expiresDate: '2025-11-15',
    backgroundCheck: 'clear',
    drugTest: 'passed',
    i9Verified: true,
    skills: ['Electrician', 'HVAC', 'General Labor'],
    certifications: ['EPA 608 Certified', 'OSHA 30'],
  };

  const copyCode = () => {
    navigator.clipboard.writeText(worker.verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const watermarkSizes = [
    { size: 'small' as const, label: 'Small', description: 'Emails, badges, inline use' },
    { size: 'medium' as const, label: 'Medium', description: 'Credentials, cards, certificates' },
    { size: 'large' as const, label: 'Large', description: 'Document watermark background' },
  ];

  const watermarkFeatures = [
    'Concentric rings = "rings of authenticity" - gets harder to fake with each layer',
    'Shield symbol = protection & verification guarantee',
    'Cyan color = ORBIT brand identity throughout the system',
    'Adjustable opacity = works as background or prominent seal',
  ];

  const usageAreas = [
    { icon: <FileText className="w-5 h-5" />, title: 'Documents', description: 'Invoice watermarks, contract stamps, official documents' },
    { icon: <CreditCard className="w-5 h-5" />, title: 'Credentials', description: 'Worker cards, employee badges, verification credentials' },
    { icon: <Mail className="w-5 h-5" />, title: 'Communications', description: 'Email headers, notification badges, system branding' },
    { icon: <Handshake className="w-5 h-5" />, title: 'Partnerships', description: 'Partner integrations, white-label customization, franchises' },
  ];

  const frontCardFeatures = [
    { title: 'Worker Photo/Avatar', description: 'Uploaded by worker (proof of identity)' },
    { title: 'Employee Number', description: 'Unique ID in ORBIT system (e.g., EMP-0892)' },
    { title: 'Full Name & Role', description: 'Current job title and company' },
    { title: 'Status Badge', description: 'Active/Inactive/On Leave' },
    { title: 'Skills', description: 'Certified skills and specialties' },
  ];

  const backCardFeatures = [
    { title: 'Contact Info', description: 'Email & phone for verification' },
    { title: 'Verification Code', description: 'Unique code to prove employment' },
    { title: 'HR File Access', description: 'Link to complete employment file' },
    { title: 'Hallmark Seal', description: 'Authentic ORBIT verification watermark' },
  ];

  const workerUseCases = [
    { title: 'Show to Employers', description: 'Pull up instantly on phone to verify employment without calling staffing agency' },
    { title: 'Job Applications', description: 'Share verification code/card when applying to prove work history' },
    { title: 'Background Checks', description: 'Use as proof of employment for loans, apartments, background checks' },
    { title: 'Professional Badge', description: "Shows they're registered with ORBIT - trusted staffing platform" },
  ];

  const hrFileItems = [
    'Employment history & current assignments',
    'Certifications & background check status',
    'Pay stubs & earnings records',
    'Time off requests & approvals',
    'Performance notes & ratings',
    'Documents & compliance records',
  ];

  const securityFeatures = [
    'UUID-based verification code (impossible to counterfeit)',
    'QR code links to live verification database',
    'Real-time status updates (revoked if worker terminated)',
    'Tamper-evident design (any changes flagged immediately)',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 relative">
      <HallmarkPageWatermark />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <PageHeader
          title="Digital Hallmark™"
          subtitle="ORBIT's seal of authenticity & worker verification system"
        />

        <div className="flex gap-4 mb-8 justify-center">
          <Button
            onClick={() => setActiveTab('watermark')}
            variant={activeTab === 'watermark' ? 'default' : 'outline'}
            className={activeTab === 'watermark' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            data-testid="button-tab-watermark"
          >
            <Zap className="w-4 h-4 mr-2" />
            Hallmark Watermark
          </Button>
          <Button
            onClick={() => setActiveTab('employee-card')}
            variant={activeTab === 'employee-card' ? 'default' : 'outline'}
            className={activeTab === 'employee-card' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            data-testid="button-tab-employee-card"
          >
            <Shield className="w-4 h-4 mr-2" />
            Employee Card
          </Button>
        </div>

        {activeTab === 'watermark' && (
          <div className="max-w-4xl mx-auto mb-12">
            <OrbitCard className="p-8 md:p-12 mb-8">
              <SectionHeader
                title="What is the Digital Hallmark?"
                subtitle="A visual seal of authenticity that stamps everything as official ORBIT product. This watermark appears on credentials, documents, emails, and worker profiles to verify legitimacy."
                align="center"
                size="lg"
              />

              <CarouselRail
                title="Watermark Sizes"
                gap="lg"
                className="mb-12"
              >
                {watermarkSizes.map((item) => (
                  <OrbitCard key={item.size} variant="glass" className="min-w-[200px] md:min-w-[280px]">
                    <div className="bg-slate-700 rounded-lg p-6 mb-4 flex justify-center">
                      <HallmarkWatermark size={item.size} opacity={40} />
                    </div>
                    <p className="text-sm font-bold text-cyan-300 text-center">{item.label}</p>
                    <p className="text-xs text-gray-400 text-center">{item.description}</p>
                  </OrbitCard>
                ))}
              </CarouselRail>

              <OrbitCard variant="glass" className="mb-8">
                <OrbitCardHeader icon={<Shield className="w-5 h-5 text-cyan-400" />}>
                  <OrbitCardTitle>Watermark Features</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <ul className="space-y-2">
                    {watermarkFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </OrbitCardContent>
              </OrbitCard>

              <SectionHeader title="Where It's Used" size="sm" className="mb-4" />
              <BentoGrid cols={2} gap="md">
                {usageAreas.map((area) => (
                  <BentoTile key={area.title} className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-cyan-400">
                      {area.icon}
                      <p className="font-bold text-cyan-300">{area.title}</p>
                    </div>
                    <p className="text-sm text-gray-400">{area.description}</p>
                  </BentoTile>
                ))}
              </BentoGrid>
            </OrbitCard>
          </div>
        )}

        {activeTab === 'employee-card' && (
          <div className="max-w-4xl mx-auto mb-12">
            <SectionHeader
              title="Digital Employee Card"
              subtitle="Worker's personal ID card - acts as a portable credential and tie-in to their HR file"
              align="center"
              size="lg"
            />

            <div className="mb-12 flex justify-center">
              <DigitalEmployeeCard
                workerId={worker.id}
                employeeNumber={worker.employeeNumber}
                fullName={worker.name}
                company="Superior Staffing"
                status="active"
                role="Electrician & HVAC Technician"
                skills={worker.skills}
                joinDate="Mar 15, 2024"
                phone="+1 (615) 555-0892"
                email="john.rodriguez@superior-staffing.com"
                verificationCode={worker.verificationCode}
                avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=john"
              />
            </div>

            <OrbitCard className="p-6 md:p-8 mb-8">
              <SectionHeader title="Card Features & Usage" size="md" />

              <BentoGrid cols={2} gap="md" className="mb-8">
                <BentoTile className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    <p className="font-bold text-cyan-300 text-lg">Front of Card</p>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-300">
                    {frontCardFeatures.map((item) => (
                      <li key={item.title} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span><strong>{item.title}:</strong> {item.description}</span>
                      </li>
                    ))}
                  </ul>
                </BentoTile>

                <BentoTile className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="w-5 h-5 text-cyan-400" />
                    <p className="font-bold text-cyan-300 text-lg">Back of Card</p>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-300">
                    {backCardFeatures.map((item) => (
                      <li key={item.title} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span><strong>{item.title}:</strong> {item.description}</span>
                      </li>
                    ))}
                  </ul>
                </BentoTile>
              </BentoGrid>

              <OrbitCard variant="action" hover={false} className="mb-8 cursor-default bg-gradient-to-r from-cyan-900/20 to-purple-900/20">
                <OrbitCardHeader icon={<Briefcase className="w-5 h-5 text-cyan-400" />}>
                  <OrbitCardTitle>How Workers Use It</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <BentoGrid cols={2} gap="sm">
                    {workerUseCases.map((useCase) => (
                      <div key={useCase.title} className="text-sm text-gray-300">
                        <p className="font-bold text-cyan-300 mb-1">✓ {useCase.title}</p>
                        <p>{useCase.description}</p>
                      </div>
                    ))}
                  </BentoGrid>
                </OrbitCardContent>
              </OrbitCard>

              <OrbitCard variant="glass" className="border-purple-400/20">
                <OrbitCardHeader icon={<Link2 className="w-5 h-5 text-purple-400" />}>
                  <OrbitCardTitle className="text-purple-300">Ties Into HR File</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    The digital employee card is just the visual part. Behind the scenes, it connects to the worker's complete HR file including:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                    {hrFileItems.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="text-purple-400">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </OrbitCardContent>
              </OrbitCard>
            </OrbitCard>
          </div>
        )}

        <OrbitCard className="overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 h-2" />

          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-2xl font-bold text-cyan-400 mb-1">ORBIT</div>
                <p className="text-xs text-gray-400">Staffing Platform</p>
              </div>
              <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-lg px-3 py-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold text-green-300">VERIFIED</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs text-gray-400 mb-1">WORKER NAME</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{worker.name}</h2>
              
              <BentoGrid cols={2} gap="md">
                <div>
                  <p className="text-xs text-gray-400">Worker ID</p>
                  <p className="text-sm font-mono text-cyan-300">{worker.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Verification Code</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-cyan-300 font-bold">{worker.verificationCode}</p>
                    <button onClick={copyCode} className="text-gray-400 hover:text-cyan-300" data-testid="button-copy-code">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-400">Copied!</p>}
                </div>
              </BentoGrid>
            </div>

            <OrbitCard variant="glass" className="mb-8">
              <p className="text-xs text-gray-400 mb-4 font-bold">SCAN TO VERIFY</p>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="w-[200px] h-[200px] bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 text-sm font-mono text-center">
                    [QR Code Here]<br/>
                    {worker.verificationCode}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Scan with smartphone or QR reader to verify worker credential
              </p>
            </OrbitCard>

            <BentoGrid cols={3} gap="md" className="mb-8">
              {[
                { label: 'BACKGROUND CHECK', value: 'Clear', note: 'No record found' },
                { label: 'DRUG TEST', value: 'Passed', note: 'Valid through 12/15/25' },
                { label: 'I-9 VERIFIED', value: 'Verified', note: 'Valid for hire' },
              ].map((item) => (
                <BentoTile key={item.label} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <p className="text-xs font-bold text-gray-300">{item.label}</p>
                  </div>
                  <p className="text-sm font-bold text-green-300">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                </BentoTile>
              ))}
            </BentoGrid>

            <BentoGrid cols={2} gap="md" className="mb-8">
              <div>
                <p className="text-xs font-bold text-gray-300 mb-3">SKILLS</p>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill) => (
                    <span key={skill} className="bg-cyan-900/30 border border-cyan-700 text-cyan-300 text-xs px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-300 mb-3">CERTIFICATIONS</p>
                <div className="flex flex-wrap gap-2">
                  {worker.certifications.map((cert) => (
                    <span key={cert} className="bg-purple-900/30 border border-purple-700 text-purple-300 text-xs px-3 py-1 rounded-full">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </BentoGrid>

            <OrbitCard variant="glass" className="mb-8">
              <BentoGrid cols={3} gap="md" className="text-center">
                <div>
                  <p className="text-xs text-gray-400">ISSUED</p>
                  <p className="text-sm font-bold text-white">{worker.issuedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">EXPIRES</p>
                  <p className="text-sm font-bold text-white">{worker.expiresDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">STATUS</p>
                  <p className="text-sm font-bold text-green-300">ACTIVE</p>
                </div>
              </BentoGrid>
            </OrbitCard>

            <OrbitCard variant="glass" className="mb-8">
              <OrbitCardHeader icon={<Shield className="w-4 h-4 text-cyan-400" />}>
                <OrbitCardTitle className="text-sm">Security Features</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
                <ul className="space-y-2 text-xs text-gray-400">
                  {securityFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </OrbitCardContent>
            </OrbitCard>

            <div className="border-t border-slate-700 pt-6 text-center">
              <p className="text-xs text-gray-400 mb-4">
                To verify this credential, scan the QR code or visit: orbit.staffing/verify/{worker.verificationCode}
              </p>
              <p className="text-xs text-gray-500">
                This credential is tamper-evident and linked to a live database. Any alterations will be detected.
              </p>
            </div>
          </div>
        </OrbitCard>

        <BentoGrid cols={3} gap="md" className="mb-8">
          <BentoTile className="p-6">
            <div className="text-2xl mb-3">📱</div>
            <OrbitCardTitle>For Workers</OrbitCardTitle>
            <OrbitCardDescription>
              Show credentials anywhere with your phone. No need to carry physical papers or wait for agency calls.
            </OrbitCardDescription>
          </BentoTile>
          <BentoTile className="p-6">
            <div className="text-2xl mb-3">🏢</div>
            <OrbitCardTitle>For Employers</OrbitCardTitle>
            <OrbitCardDescription>
              Instantly verify workers on-site. Scan the QR code to confirm identity and compliance status.
            </OrbitCardDescription>
          </BentoTile>
          <BentoTile className="p-6">
            <div className="text-2xl mb-3">🔒</div>
            <OrbitCardTitle>Security Built-In</OrbitCardTitle>
            <OrbitCardDescription>
              Impossible to counterfeit with UUID codes and live verification. Any tampering is detected immediately.
            </OrbitCardDescription>
          </BentoTile>
        </BentoGrid>
      </div>
    </div>
  );
}

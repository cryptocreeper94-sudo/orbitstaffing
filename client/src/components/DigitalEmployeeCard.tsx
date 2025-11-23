/**
 * Digital Employee Card / Worker ID Card
 * Personal credential card for workers showing their status in the system
 * Ties into HR file, can be pulled up anytime
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { HallmarkWatermark, HallmarkBadge } from './HallmarkWatermark';
import { Calendar, CheckCircle, MapPin, Phone } from 'lucide-react';

interface DigitalEmployeeCardProps {
  workerId: string;
  employeeNumber: string;
  fullName: string;
  avatarUrl?: string;
  company: string;
  status: 'active' | 'inactive' | 'on_leave';
  role: string;
  skills?: string[];
  joinDate: string;
  phone?: string;
  email?: string;
  verificationCode?: string;
}

export function DigitalEmployeeCard({
  workerId,
  employeeNumber,
  fullName,
  avatarUrl,
  company,
  status,
  role,
  skills = [],
  joinDate,
  phone,
  email,
  verificationCode,
}: DigitalEmployeeCardProps) {
  const [flipped, setFlipped] = useState(false);

  const statusColors = {
    active: 'bg-green-900/20 border-green-700 text-green-300',
    inactive: 'bg-gray-900/20 border-gray-700 text-gray-300',
    on_leave: 'bg-yellow-900/20 border-yellow-700 text-yellow-300',
  };

  const statusLabels = {
    active: 'ACTIVE',
    inactive: 'INACTIVE',
    on_leave: 'ON LEAVE',
  };

  return (
    <div
      className="w-full max-w-sm mx-auto cursor-pointer perspective"
      onClick={() => setFlipped(!flipped)}
      data-testid="card-employee-id"
    >
      {/* Card Container with 3D flip effect */}
      <div
        className="relative w-full transition-transform duration-500 transform-gpu"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT OF CARD */}
        <div
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-cyan-400/50 shadow-2xl p-6 min-h-[480px] relative overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
          data-testid="card-employee-front"
        >
          {/* Hallmark watermark background */}
          <div className="absolute -right-12 -top-12 opacity-10 pointer-events-none">
            <HallmarkWatermark size="large" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header with company */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs text-gray-400 font-bold">ISSUED BY</div>
                <div className="text-lg font-bold text-cyan-400">{company}</div>
              </div>
              <HallmarkBadge />
            </div>

            {/* Photo & Basic Info */}
            <div className="flex gap-4 mb-6">
              {/* Avatar/Photo */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-24 h-24 rounded-lg border-2 border-cyan-400 object-cover"
                  data-testid="img-employee-avatar"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-cyan-400 bg-gray-700 flex items-center justify-center text-gray-400">
                  <span className="text-sm">No Photo</span>
                </div>
              )}

              {/* Name & Status */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1" data-testid="text-employee-name">
                  {fullName}
                </h2>
                <p className="text-xs text-gray-400 mb-3">{role}</p>

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-1 border rounded px-2 py-1 ${statusColors[status]}`}>
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs font-bold">{statusLabels[status]}</span>
                </div>
              </div>
            </div>

            {/* Employee Number */}
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-cyan-400/20">
              <div className="text-xs text-gray-400 mb-1">EMPLOYEE NUMBER</div>
              <div className="text-lg font-mono font-bold text-cyan-300" data-testid="text-employee-number">
                {employeeNumber}
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <Calendar className="w-4 h-4" />
              <span>
                Member since <span className="text-cyan-300 font-bold">{joinDate}</span>
              </span>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-400 font-bold mb-2">SKILLS</div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-cyan-900/30 border border-cyan-700 text-cyan-300 text-xs px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Click to flip hint */}
            <div className="text-xs text-gray-500 text-center mt-auto pt-4">
              Click to flip card
            </div>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-cyan-400/50 shadow-2xl p-6 min-h-[480px] relative overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          data-testid="card-employee-back"
        >
          {/* Hallmark watermark background */}
          <div className="absolute -left-12 -bottom-12 opacity-10 pointer-events-none">
            <HallmarkWatermark size="large" />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-xs text-gray-400 font-bold mb-4">CONTACT & VERIFICATION</div>

            {/* Contact Info */}
            {(email || phone) && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-cyan-400/20">
                {email && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-400">EMAIL</div>
                    <div className="text-sm text-cyan-300 font-mono break-all">{email}</div>
                  </div>
                )}
                {phone && (
                  <div>
                    <div className="text-xs text-gray-400">PHONE</div>
                    <div className="text-sm text-cyan-300 font-mono">{phone}</div>
                  </div>
                )}
              </div>
            )}

            {/* Verification Code */}
            {verificationCode && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-cyan-400/20">
                <div className="text-xs text-gray-400 font-bold mb-2">VERIFICATION CODE</div>
                <div className="text-sm font-mono text-cyan-300 break-all font-bold">{verificationCode}</div>
                <p className="text-xs text-gray-500 mt-2">Use to verify employment when applying for jobs</p>
              </div>
            )}

            {/* HR File Access */}
            <div className="bg-cyan-900/10 rounded-lg p-4 border border-cyan-700/50 mb-6">
              <div className="text-xs text-gray-300 font-bold mb-2">📁 HR FILE ACCESS</div>
              <p className="text-xs text-gray-400">
                This card serves as your digital employee badge. Show to employers for instant verification. Your complete HR file is available in the ORBIT app.
              </p>
            </div>

            {/* Expiration/Validity */}
            <div className="text-xs text-gray-500 text-center">
              Valid as long as employment is active
            </div>

            {/* Click to flip hint */}
            <div className="text-xs text-gray-500 text-center mt-auto pt-4">
              Click to flip card
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

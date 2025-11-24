/**
 * Sidonie's Abilities Card
 * Shows her special powers as Ops Manager
 */
import React, { useState } from 'react';
import { Shield, Lock, Eye, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SidonieAbilitiesProps {
  sidonieName: string;
  assetNumber: string;
}

export default function SidonieAbilities({ sidonieName, assetNumber }: SidonieAbilitiesProps) {
  const [expandedAbility, setExpandedAbility] = useState<string | null>(null);

  const abilities = [
    {
      id: 'password-reset',
      icon: Lock,
      title: 'Admin Password Reset',
      description: 'Reset any admin password',
      details: 'You can securely reset passwords for any admin account in the system. Changes are logged and timestamped.',
    },
    {
      id: 'visibility-control',
      icon: Eye,
      title: 'Account Visibility Control',
      description: 'Hide/Show customer accounts',
      details: 'Toggle account visibility. Hidden accounts are only visible to you, Dev, and the account owner. Other admins cannot see hidden accounts.',
    },
    {
      id: 'crm-access',
      icon: Users,
      title: 'Full CRM Access',
      description: 'Complete customer data access',
      details: 'You have unrestricted access to all CRM data: contacts, notes, customer profiles, and communication history.',
    },
    {
      id: 'ownership',
      icon: Shield,
      title: 'Account Ownership Management',
      description: 'Designate account owners',
      details: 'You can assign account ownership to any admin. Account owners manage customer service for their accounts.',
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border-2 border-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-300">
          <Shield className="w-6 h-6" />
          Your Admin Abilities
        </CardTitle>
        <p className="text-sm text-gray-300 mt-2">
          As Ops Manager, you have elevated permissions beyond standard admins.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {abilities.map((ability) => {
          const Icon = ability.icon;
          const isExpanded = expandedAbility === ability.id;

          return (
            <div
              key={ability.id}
              className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500 transition-all cursor-pointer"
              onClick={() => setExpandedAbility(isExpanded ? null : ability.id)}
              data-testid={`ability-${ability.id}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-white">{ability.title}</h4>
                  <p className="text-sm text-gray-400">{ability.description}</p>

                  {isExpanded && (
                    <div className="mt-2 p-2 bg-slate-900/50 border border-purple-500/30 rounded text-xs text-gray-300">
                      {ability.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div className="text-sm text-blue-200">
            <p className="font-bold">Remember:</p>
            <p>Your actions are logged. Use your abilities responsibly to maintain system integrity.</p>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center mt-3">
          Asset ID: {assetNumber}
        </div>
      </CardContent>
    </Card>
  );
}

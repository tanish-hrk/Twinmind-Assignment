// Permission request component

import { useState } from 'react';
import { Shield, Mic, Camera, Check, X } from 'lucide-react';
import { PermissionManager, type Permission } from '@/utils/permissions';

interface PermissionInfo {
  permission: Permission;
  title: string;
  description: string;
  icon: React.ReactNode;
  why: string;
}

const PERMISSIONS: PermissionInfo[] = [
  {
    permission: 'tabCapture',
    title: 'Tab Capture',
    description: 'Capture screenshots and visual context from your browsing',
    icon: <Camera className="w-5 h-5" />,
    why: 'Helps remember what you saw on important pages',
  },
  {
    permission: 'audioCapture',
    title: 'Audio Capture',
    description: 'Record and transcribe audio from tabs (videos, meetings)',
    icon: <Mic className="w-5 h-5" />,
    why: 'Enables AI-powered transcription and audio insights',
  },
];

interface PermissionRequestProps {
  permission: Permission;
  onGranted: () => void;
  onDenied: () => void;
}

export function PermissionRequest({ permission, onGranted, onDenied }: PermissionRequestProps) {
  const [requesting, setRequesting] = useState(false);
  const info = PERMISSIONS.find((p) => p.permission === permission);

  if (!info) return null;

  const handleRequest = async () => {
    setRequesting(true);
    const granted = await PermissionManager.request(permission);
    setRequesting(false);

    if (granted) {
      onGranted();
    } else {
      onDenied();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
            {info.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{info.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Optional Feature</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">{info.description}</p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Why we need this
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">{info.why}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Privacy:</strong> You can revoke this permission anytime in settings. Data is
            stored locally and never shared without your consent.
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDenied}
            disabled={requesting}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Not Now
          </button>
          <button
            onClick={handleRequest}
            disabled={requesting}
            className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {requesting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Grant Permission
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

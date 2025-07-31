'use client';

import { useState } from 'react';

interface MedicalDisclaimerProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function MedicalDisclaimer({ isOpen, onClose, onAccept }: MedicalDisclaimerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="text-blue-600 mr-3">⚕️</span>
            Important Medical Information
          </h2>
        </div>

        <div className="p-6 space-y-4 text-sm text-gray-700 leading-relaxed">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Not Medical Advice</h3>
            <p>
              GLP-1 Mindful Evenings is a wellness tool designed to support mindful eating practices. 
              This app is not intended to provide medical advice, diagnosis, or treatment recommendations.
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Consult Your Healthcare Provider</h3>
            <p>
              Always consult with your healthcare provider before making changes to your eating habits, 
              medication routine, or if you have concerns about your GLP-1 medication. Your doctor is 
              the best resource for personalized medical guidance.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Mental Health Support</h3>
            <p>
              If you're experiencing persistent emotional distress, disordered eating patterns, or 
              mental health concerns, please reach out to a qualified mental health professional. 
              This tool is designed to complement, not replace, professional support.
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">Emergency Situations</h3>
            <p>
              If you're experiencing a medical emergency or thoughts of self-harm, please contact 
              emergency services immediately (911 in the US) or contact the National Suicide Prevention 
              Lifeline at 988.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">By using this app, you acknowledge that:</h3>
            <ul className="space-y-1 ml-4">
              <li>• This tool is for educational and wellness purposes only</li>
              <li>• You will consult your healthcare provider for medical decisions</li>
              <li>• You understand this is not a substitute for professional medical care</li>
              <li>• You will seek appropriate help if experiencing mental health concerns</li>
              <li>• The AI-generated insights are suggestions, not medical recommendations</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Data Privacy:</strong> Your check-in data is stored securely and is not shared 
              with third parties. AI insights are generated to support your wellness journey and 
              are not stored or used for any other purposes.
            </p>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            I Need to Review This
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium"
          >
            I Understand & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
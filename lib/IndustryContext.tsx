import React, { createContext, useContext, useState, useEffect } from 'react';
import { app } from './firebaseCore';

interface IndustryContextType {
  industryType: string;
  setIndustryTypeState: (type: string) => void;
  updateIndustryInFirebase: (uid: string, type: string) => Promise<void>;
}

const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export const IndustryProvider: React.FC<{ children: React.ReactNode; initialIndustryType?: string }> = ({
  children,
  initialIndustryType = '',
}) => {
  const [industryType, setIndustryType] = useState<string>(initialIndustryType);

  useEffect(() => {
    if (initialIndustryType) {
      setIndustryType(initialIndustryType);
    }
  }, [initialIndustryType]);

  const setIndustryTypeState = (type: string) => {
    setIndustryType(type);
  };

  const updateIndustryInFirebase = async (uid: string, type: string) => {
    setIndustryType(type);
    if (uid) {
      try {
        const { doc, updateDoc, getFirestore } = await import('firebase/firestore');
        if (!app) return;
        const userRef = doc(getFirestore(app as any), 'users', uid);
        await updateDoc(userRef, {
          industryType: type,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Failed to update industry in Firestore:", e);
      }
    }
  };

  return (
    <IndustryContext.Provider value={{ industryType, setIndustryTypeState, updateIndustryInFirebase }}>
      {ch¶»§q«^
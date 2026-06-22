import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

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
    if (db && Object.keys(db).length > 0 && uid) {
      try {
        const userRef = doc(db as any, 'users', uid);
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
      {children}
    </IndustryContext.Provider>
  );
};

export const useIndustry = () => {
  const context = useContext(IndustryContext);
  if (!context) {
    throw new Error('useIndustry must be used within an IndustryProvider');
  }
  return context;
};

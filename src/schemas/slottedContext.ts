export interface SlottedContext {
  company: {
    name: string;
    industry: string;
    size: 'startup' | 'small' | 'medium' | 'enterprise';
    description: string;
    website?: string;
  };
  brandDNA: {
    valuePropositions: string[];
    coreOfferings: string[];
    targetAudience: {
      demographics: string;
      psychographics: string;
      painPoints: string[];
      impact?: string;
    };
    brandTone: {
      personality: string[];
      voiceAttributes: string[];
      communicationStyle: 'formal' | 'casual' | 'conversational' | 'technical';
    };
    brandColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  marketingGoals: {
    primaryGoals: string[];
    kpis: string[];
    cadence: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
    budget?: string;
    channels: {
      primary: string[];
      secondary: string[];
      experimental: string[];
    };
  };
  gtmStrategy: {
    segments: Array<{
      name: string;
      description: string;
      channels: string[];
      messaging: string;
    }>;
    competitiveAdvantage: string;
    marketPosition: string;
  };
  contentPreferences: {
    contentTypes: string[];
    lengthPreferences: {
      blog: number;
      social: number;
      email: number;
    };
    styleGuidelines: string[];
  };
  aiPersona: {
    personalityTraits: string[];
    communicationPattern: string;
    knowledgeAreas: string[];
    constraints: string[];
  };
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
    mcpCompatible: boolean;
  };
}

export const defaultSlottedContext = {
  brandDNA: {
    brandColors: {
      primary: '#2563eb',
      secondary: '#3b82f6',
      accent: '#10b981',
    },
  },
  marketingGoals: {
    cadence: 'weekly' as const,
  },
  contentPreferences: {
    lengthPreferences: {
      blog: 2000,
      social: 280,
      email: 500,
    },
  },
};
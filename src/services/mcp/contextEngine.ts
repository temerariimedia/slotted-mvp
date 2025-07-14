import { SlottedContext, defaultSlottedContext } from '../../schemas/slottedContext';

export class MCPContextEngine {
  private context: SlottedContext | null = null;
  private listeners: Array<(context: SlottedContext) => void> = [];

  constructor() {
    this.loadContext();
  }

  public async loadContext(): Promise<SlottedContext | null> {
    try {
      const stored = localStorage.getItem('slotted_context');
      if (stored) {
        this.context = JSON.parse(stored);
        this.notifyListeners();
        return this.context;
      }
    } catch (error) {
      console.error('Failed to load MCP context:', error);
    }
    return null;
  }

  public async saveContext(context: SlottedContext): Promise<void> {
    try {
      context.metadata = {
        ...context.metadata,
        updatedAt: new Date().toISOString(),
        mcpCompatible: true,
      };
      
      this.context = context;
      localStorage.setItem('slotted_context', JSON.stringify(context));
      this.notifyListeners();
      
      console.log('MCP Context saved successfully');
    } catch (error) {
      console.error('Failed to save MCP context:', error);
      throw error;
    }
  }

  public getContext(): SlottedContext | null {
    return this.context;
  }

  public getMCPPromptContext(): string {
    if (!this.context) {
      return 'No company context available. Please complete onboarding first.';
    }

    return `
COMPANY CONTEXT (MCP):
Company: ${this.context.company.name} - ${this.context.company.industry}
Size: ${this.context.company.size}
Description: ${this.context.company.description}

BRAND DNA:
Value Propositions: ${this.context.brandDNA.valuePropositions.join(', ')}
Core Offerings: ${this.context.brandDNA.coreOfferings.join(', ')}
Target Audience: ${this.context.brandDNA.targetAudience.demographics}
Pain Points: ${this.context.brandDNA.targetAudience.painPoints.join(', ')}
Brand Tone: ${this.context.brandDNA.brandTone.personality.join(', ')} - ${this.context.brandDNA.brandTone.communicationStyle}
Brand Colors: Primary: ${this.context.brandDNA.brandColors.primary}, Secondary: ${this.context.brandDNA.brandColors.secondary}

MARKETING STRATEGY:
Primary Goals: ${this.context.marketingGoals.primaryGoals.join(', ')}
Content Cadence: ${this.context.marketingGoals.cadence}
Primary Channels: ${this.context.marketingGoals.channels.primary.join(', ')}
Secondary Channels: ${this.context.marketingGoals.channels.secondary.join(', ')}

GTM STRATEGY:
Market Position: ${this.context.gtmStrategy.marketPosition}
Competitive Advantage: ${this.context.gtmStrategy.competitiveAdvantage}

AI PERSONA:
Personality: ${this.context.aiPersona.personalityTraits.join(', ')}
Communication: ${this.context.aiPersona.communicationPattern}
Knowledge Areas: ${this.context.aiPersona.knowledgeAreas.join(', ')}
    `.trim();
  }

  public subscribe(listener: (context: SlottedContext) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    if (this.context) {
      this.listeners.forEach(listener => listener(this.context!));
    }
  }

  public exportContextAsJSON(): string {
    if (!this.context) {
      throw new Error('No context available to export');
    }
    return JSON.stringify(this.context, null, 2);
  }

  public importContextFromJSON(jsonString: string): void {
    try {
      const imported = JSON.parse(jsonString) as SlottedContext;
      this.saveContext(imported);
    } catch (error) {
      console.error('Failed to import context:', error);
      throw new Error('Invalid JSON format for context import');
    }
  }

  public createInitialContext(onboardingData: Partial<SlottedContext>): SlottedContext {
    const context: SlottedContext = {
      ...defaultSlottedContext,
      ...onboardingData,
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mcpCompatible: true,
      },
    } as SlottedContext;

    return context;
  }
}

export const mcpContextEngine = new MCPContextEngine();
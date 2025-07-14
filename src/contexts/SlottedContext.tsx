import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SlottedContext } from '../schemas/slottedContext';
import { mcpContextEngine } from '../services/mcp/contextEngine';

interface SlottedContextState {
  context: SlottedContext | null;
  isLoading: boolean;
  saveContext: (context: SlottedContext) => Promise<void>;
  getMCPPromptContext: () => string;
  exportContext: () => string;
  importContext: (jsonString: string) => void;
}

const SlottedContextContext = createContext<SlottedContextState | undefined>(undefined);

interface SlottedContextProviderProps {
  children: ReactNode;
}

export const SlottedContextProvider: React.FC<SlottedContextProviderProps> = ({ children }) => {
  const [context, setContext] = useState<SlottedContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialContext = async () => {
      try {
        const loadedContext = await mcpContextEngine.loadContext();
        setContext(loadedContext);
      } catch (error) {
        console.error('Failed to load initial context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialContext();

    const unsubscribe = mcpContextEngine.subscribe((updatedContext) => {
      setContext(updatedContext);
    });

    return unsubscribe;
  }, []);

  const saveContext = async (newContext: SlottedContext) => {
    try {
      await mcpContextEngine.saveContext(newContext);
    } catch (error) {
      console.error('Failed to save context:', error);
      throw error;
    }
  };

  const getMCPPromptContext = () => {
    return mcpContextEngine.getMCPPromptContext();
  };

  const exportContext = () => {
    return mcpContextEngine.exportContextAsJSON();
  };

  const importContext = (jsonString: string) => {
    mcpContextEngine.importContextFromJSON(jsonString);
  };

  const value: SlottedContextState = {
    context,
    isLoading,
    saveContext,
    getMCPPromptContext,
    exportContext,
    importContext,
  };

  return (
    <SlottedContextContext.Provider value={value}>
      {children}
    </SlottedContextContext.Provider>
  );
};

export const useSlottedContext = (): SlottedContextState => {
  const context = useContext(SlottedContextContext);
  if (context === undefined) {
    throw new Error('useSlottedContext must be used within a SlottedContextProvider');
  }
  return context;
};
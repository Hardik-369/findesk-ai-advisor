
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAIResponse = async (prompt: string, context?: string, type?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { prompt, context, type }
      });

      if (error) throw error;
      
      return data.response;
    } catch (error) {
      console.error('AI request failed:', error);
      toast({
        title: "AI Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getAIResponse, loading };
};

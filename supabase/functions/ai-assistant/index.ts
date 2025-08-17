
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context, type } = await req.json();
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!openRouterKey) {
      throw new Error('OpenRouter API key not configured');
    }

    let systemPrompt = '';
    
    switch (type) {
      case 'depreciation':
        systemPrompt = 'You are a financial expert specializing in asset depreciation. Provide detailed analysis of depreciation methods and suggest the most tax-efficient approach.';
        break;
      case 'loan':
        systemPrompt = 'You are a loan and EMI specialist. Analyze loan terms and suggest optimal strategies for interest savings and repayment planning.';
        break;
      case 'tax':
        systemPrompt = 'You are a tax planning expert. Suggest legal deductions and tax optimization strategies based on Indian tax laws.';
        break;
      case 'chat':
        systemPrompt = 'You are FinAI, a financial assistant. Answer questions about personal finance, investments, loans, taxes, and provide actionable advice.';
        break;
      default:
        systemPrompt = 'You are a helpful financial assistant.';
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://finai-desk.lovable.app',
        'X-Title': 'FinAI Desk'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${prompt}\n\nContext: ${context || 'No additional context'}` }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

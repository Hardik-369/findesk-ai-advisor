
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAI } from '@/hooks/useAI';
import { Bot, Send, User } from 'lucide-react';

interface Message {
  id: string;
  message: string;
  response: string;
  created_at: string;
}

export const AIChat = () => {
  const { user } = useAuth();
  const { getAIResponse, loading } = useAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) throw error;
      if (data) setMessages(data);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    
    // Get user's financial context
    const context = await getFinancialContext();
    
    const aiResponse = await getAIResponse(
      userMessage,
      context,
      'chat'
    );
    
    if (aiResponse) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert([{
            user_id: user.id,
            message: userMessage,
            response: aiResponse,
            context_type: 'dashboard'
          }])
          .select()
          .single();
        
        if (error) throw error;
        if (data) setMessages(prev => [...prev, data]);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  };

  const getFinancialContext = async () => {
    if (!user) return '';
    
    let context = '';
    
    try {
      // Get user's assets
      const { data: assets } = await supabase
        .from('assets')
        .select('name, purchase_value, depreciation_method')
        .eq('user_id', user.id);
      
      if (assets && assets.length > 0) {
        context += `Assets: ${assets.map(a => `${a.name} (₹${a.purchase_value})`).join(', ')}. `;
      }
      
      // Get user's loans
      const { data: loans } = await supabase
        .from('loans')
        .select('loan_name, emi_amount, tenure_months')
        .eq('user_id', user.id);
      
      if (loans && loans.length > 0) {
        context += `Loans: ${loans.map(l => `${l.loan_name} EMI ₹${l.emi_amount}`).join(', ')}. `;
      }
      
      // Get user's tax records
      const { data: taxRecords } = await supabase
        .from('tax_records')
        .select('financial_year, calculated_tax')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (taxRecords && taxRecords.length > 0) {
        context += `Latest tax calculation for ${taxRecords[0].financial_year}: ₹${taxRecords[0].calculated_tax}. `;
      }
    } catch (error) {
      console.error('Error getting financial context:', error);
    }
    
    return context;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          FinAI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Hi! I'm your AI financial assistant. Ask me about your loans, taxes, or investments!</p>
              <div className="mt-4 space-y-2 text-sm">
                <p>Try asking:</p>
                <p>• "How much is my next EMI payment?"</p>
                <p>• "How can I reduce my tax this quarter?"</p>
                <p>• "What's my total asset value?"</p>
              </div>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={msg.id || index} className="space-y-2">
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 mt-1 flex-shrink-0" />
                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Bot className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm">{msg.response}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about your finances..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={loading || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

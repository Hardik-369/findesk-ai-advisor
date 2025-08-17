
import React from 'react';
import { Layout } from '@/components/Layout';
import { LoanCalculator } from '@/components/LoanCalculator';

const LoanPage = () => {
  return (
    <Layout showAuth={false}>
      <div className="container mx-auto px-4 py-8">
        <LoanCalculator />
      </div>
    </Layout>
  );
};

export default LoanPage;

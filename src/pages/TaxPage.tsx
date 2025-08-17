
import React from 'react';
import { Layout } from '@/components/Layout';
import { TaxCalculator } from '@/components/TaxCalculator';

const TaxPage = () => {
  return (
    <Layout showAuth={false}>
      <div className="container mx-auto px-4 py-8">
        <TaxCalculator />
      </div>
    </Layout>
  );
};

export default TaxPage;

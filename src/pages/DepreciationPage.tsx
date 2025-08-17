
import React from 'react';
import { Layout } from '@/components/Layout';
import { DepreciationCalculator } from '@/components/DepreciationCalculator';

const DepreciationPage = () => {
  return (
    <Layout showAuth={false}>
      <div className="container mx-auto px-4 py-8">
        <DepreciationCalculator />
      </div>
    </Layout>
  );
};

export default DepreciationPage;

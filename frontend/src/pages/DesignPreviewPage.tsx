import React from 'react';
import DesignPreview from '../components/DesignPreview';

const DesignPreviewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <DesignPreview />
    </div>
  );
};

export default DesignPreviewPage;
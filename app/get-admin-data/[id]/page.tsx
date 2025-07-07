'use client';

import axios from 'axios';
import { useState, use } from 'react';

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const GetAdminsButton = ({params} : PostPageProps) => {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const [admins, setAdmins] = useState<any>({});

  const handleFetchAdmins = async (orgId : String) => {
    try {
      const response = await axios.post('/api/get-admin-details', {
        organizationId: orgId, 
      });

      setAdmins(response.data);
      console.log('Fetched admins:', response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <button
        onClick={()=>{
            handleFetchAdmins(resolvedParams.id);
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Get Organization Admins
      </button>

      {admins && (
       
            <span key={admins.id}>{admins?.email}</span>
      )}
    </div>
  );
};

export default GetAdminsButton;
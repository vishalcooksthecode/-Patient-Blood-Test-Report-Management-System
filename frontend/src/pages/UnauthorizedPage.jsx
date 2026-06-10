import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-8xl">🔒</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-500">You don't have permission to view this page.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );
}

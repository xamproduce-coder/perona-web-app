import { useNavigate } from 'react-router-dom';
import BookingView from '../components/booking/BookingView';

export default function Record() {
  const navigate = useNavigate();
  return <BookingView onClose={() => navigate('/')} />;
}

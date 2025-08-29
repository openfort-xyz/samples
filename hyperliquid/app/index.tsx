import LoginScreen from '@/components/LoginScreen';
import { UserScreen } from '@/components/UserScreen';
import { useOpenfort } from '@openfort/react-native';

export default function Index() {
  const { user } = useOpenfort();
  console.log('User:', user);

  return !user ? <LoginScreen /> : <UserScreen />;
  // return <UserScreen />
}

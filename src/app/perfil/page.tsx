import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { UserProfile } from '@/components/user/UserProfile';
import { UserComments } from '@/components/user/UserComments';
import { UserLikedNews } from '@/components/user/UserLikedNews';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Meu Perfil | ${SITE_NAME}`,
  description: 'Gerencie seu perfil e veja suas interações',
};

export default function ProfilePage() {
  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Meu Perfil</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Gerencie seu perfil e veja suas interações
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
          <UserProfile />
          <div className="space-y-8">
            <UserLikedNews />
            <UserComments />
          </div>
        </div>
      </div>
    </RootLayout>
  );
}

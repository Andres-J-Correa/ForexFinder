import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useUser } from '@/contexts/UserContext';
import { getLocationTokens } from '@/services/admin-service';
import type { LocationToken } from '@/types/admin-service.types';
import { handleError } from '@/utils/error-handler';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [tokens, setTokens] = useState<LocationToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
      return;
    }

    if (!isLoading && user && user.role !== 'admin') {
      router.replace('/');
      return;
    }

    if (user?.role === 'admin') {
      loadTokens();
    }
  }, [user, isLoading, router]);

  const loadTokens = async () => {
    try {
      setLoadingTokens(true);
      const data = await getLocationTokens();
      setTokens(data);
    } catch (error) {
      handleError(
        error,
        'AdminDashboard.loadTokens',
        'Failed to load location tokens',
      );
    } finally {
      setLoadingTokens(false);
    }
  };

  if (isLoading || loadingTokens) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgb(56 56 58)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="rgb(249 218 71)" />
      </View>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const usedTokens = tokens.filter((t) => t.usedAt !== null);
  const unusedTokens = tokens.filter((t) => t.usedAt === null);

  return (
    <View style={{ flex: 1, backgroundColor: 'rgb(56 56 58)' }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text
          style={{
            color: '#fff',
            fontSize: 28,
            fontWeight: '700',
            marginBottom: 8,
          }}>
          Admin Dashboard
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: 24,
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#1f1f1f',
              padding: 16,
              borderRadius: 12,
            }}>
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700' }}>
              {tokens.length}
            </Text>
            <Text style={{ color: '#999', fontSize: 14, marginTop: 4 }}>
              Total Tokens
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: '#1f1f1f',
              padding: 16,
              borderRadius: 12,
            }}>
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700' }}>
              {usedTokens.length}
            </Text>
            <Text style={{ color: '#999', fontSize: 14, marginTop: 4 }}>
              Used
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: '#1f1f1f',
              padding: 16,
              borderRadius: 12,
            }}>
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700' }}>
              {unusedTokens.length}
            </Text>
            <Text style={{ color: '#999', fontSize: 14, marginTop: 4 }}>
              Available
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/admin/generate-token')}
          style={{
            padding: 16,
            backgroundColor: 'rgb(249 218 71)',
            borderRadius: 12,
            marginBottom: 24,
          }}>
          <Text
            style={{
              color: '#000',
              fontSize: 18,
              fontWeight: '700',
              textAlign: 'center',
            }}>
            Generate New Token
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/admin/tokens-list')}
          style={{
            padding: 16,
            backgroundColor: '#1f1f1f',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgb(249 218 71)',
          }}>
          <Text
            style={{
              color: 'rgb(249 218 71)',
              fontSize: 18,
              fontWeight: '700',
              textAlign: 'center',
            }}>
            View All Tokens
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}


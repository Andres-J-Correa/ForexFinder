import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUser } from '@/contexts/UserContext';
import { getLocationTokens } from '@/services/admin-service';
import type { LocationToken } from '@/types/admin-service.types';
import { handleError } from '@/utils/error-handler';

export default function TokensList() {
  const router = useRouter();
  const { user } = useUser();
  const [tokens, setTokens] = useState<LocationToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'used' | 'unused'>('all');

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.replace('/');
      return;
    }
    loadTokens();
  }, [user, router]);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const data = await getLocationTokens();
      setTokens(data);
    } catch (error) {
      handleError(
        error,
        'TokensList.loadTokens',
        'Failed to load location tokens',
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens =
    filter === 'all'
      ? tokens
      : filter === 'used'
        ? tokens.filter((t) => t.usedAt !== null)
        : tokens.filter((t) => t.usedAt === null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
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

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: 'rgb(56 56 58)' }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text
          style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 16,
          }}>
          Location Tokens
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            marginBottom: 16,
          }}>
          <Pressable
            onPress={() => setFilter('all')}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: filter === 'all' ? 'rgb(249 218 71)' : '#1f1f1f',
              borderRadius: 8,
            }}>
            <Text
              style={{
                color: filter === 'all' ? '#000' : '#fff',
                fontSize: 14,
                fontWeight: '700',
                textAlign: 'center',
              }}>
              All
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilter('used')}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: filter === 'used' ? 'rgb(249 218 71)' : '#1f1f1f',
              borderRadius: 8,
            }}>
            <Text
              style={{
                color: filter === 'used' ? '#000' : '#fff',
                fontSize: 14,
                fontWeight: '700',
                textAlign: 'center',
              }}>
              Used
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilter('unused')}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor:
                filter === 'unused' ? 'rgb(249 218 71)' : '#1f1f1f',
              borderRadius: 8,
            }}>
            <Text
              style={{
                color: filter === 'unused' ? '#000' : '#fff',
                fontSize: 14,
                fontWeight: '700',
                textAlign: 'center',
              }}>
              Available
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16, paddingTop: 0 }}>
        {filteredTokens.length === 0 ? (
          <View
            style={{
              padding: 24,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#999', fontSize: 16 }}>
              No tokens found
            </Text>
          </View>
        ) : (
          filteredTokens.map((token) => (
            <View
              key={token.id}
              style={{
                backgroundColor: '#1f1f1f',
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: token.usedAt ? '#666' : 'rgb(249 218 71)',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                <Text
                  style={{
                    color: token.usedAt ? '#999' : 'rgb(249 218 71)',
                    fontSize: 12,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}>
                  {token.usedAt ? 'Used' : 'Available'}
                </Text>
                {token.shop && (
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: '600',
                    }}>
                    Shop: {token.shop.name}
                  </Text>
                )}
              </View>

              <Text style={{ color: '#fff', fontSize: 14, marginBottom: 4 }}>
                Location: {Number(token.latitude).toFixed(6)}, {Number(token.longitude).toFixed(6)}
              </Text>

              <Text style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>
                Created: {formatDate(token.createdAt)}
              </Text>

              <Text style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>
                Expires: {formatDate(token.expiresAt)}
              </Text>

              {token.usedAt && (
                <Text style={{ color: '#999', fontSize: 12 }}>
                  Used: {formatDate(token.usedAt)}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.back()}
        style={{
          margin: 16,
          padding: 12,
          backgroundColor: '#1f1f1f',
          borderRadius: 8,
        }}>
        <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>
          Back
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}


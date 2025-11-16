import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUser } from '@/contexts/UserContext';
import { generateLocationToken } from '@/services/admin-service';
import { handleError } from '@/utils/error-handler';

// TODO: Add Google Maps integration for visual coordinate selection
// Install: npx expo install react-native-maps or use expo-maps
// This would allow clicking on a map to select coordinates instead of manual input

export default function GenerateToken() {
  const router = useRouter();
  const { user } = useUser();
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [expirationDays, setExpirationDays] = useState('30');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Please enter latitude and longitude');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      Alert.alert('Error', 'Latitude must be between -90 and 90');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      Alert.alert('Error', 'Longitude must be between -180 and 180');
      return;
    }

    const expDays = expirationDays ? parseInt(expirationDays, 10) : 30;
    if (isNaN(expDays) || expDays < 1 || expDays > 365) {
      Alert.alert('Error', 'Expiration days must be between 1 and 365');
      return;
    }

    try {
      setLoading(true);
      const result = await generateLocationToken({
        latitude: lat,
        longitude: lng,
        expirationDays: expDays,
      });
      setGeneratedToken(result.token);
      
      // Clear form fields after successful generation
      setLatitude('');
      setLongitude('');
      setExpirationDays('30');
      
      Alert.alert('Success', 'Token generated successfully!');
    } catch (error) {
      handleError(
        error,
        'GenerateToken.handleGenerate',
        'Failed to generate token',
      );
      Alert.alert('Error', 'Failed to generate token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedToken) {
      await Clipboard.setStringAsync(generatedToken);
      Alert.alert('Success', 'Token copied to clipboard!');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgb(56 56 58)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>
          Admin access required
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: 'rgb(249 218 71)',
            borderRadius: 8,
          }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgb(56 56 58)' }}>
    <ScrollView
      style={{ flex: 1, backgroundColor: 'rgb(56 56 58)' }}
      contentContainerStyle={{ padding: 16 }}>
      <Text
        style={{
          color: '#fff',
          fontSize: 24,
          fontWeight: '700',
          marginBottom: 24,
        }}>
        Generate Location Token
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
          Latitude
        </Text>
        <TextInput
          value={latitude}
          onChangeText={setLatitude}
          placeholder="e.g., 40.7128"
          placeholderTextColor="#999"
          keyboardType="numeric"
          style={{
            backgroundColor: '#1f1f1f',
            color: '#fff',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#333',
          }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
          Longitude
        </Text>
        <TextInput
          value={longitude}
          onChangeText={setLongitude}
          placeholder="e.g., -74.0060"
          placeholderTextColor="#999"
          keyboardType="numeric"
          style={{
            backgroundColor: '#1f1f1f',
            color: '#fff',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#333',
          }}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
          Expiration Days (optional, default: 30)
        </Text>
        <TextInput
          value={expirationDays}
          onChangeText={setExpirationDays}
          placeholder="30"
          placeholderTextColor="#999"
          keyboardType="numeric"
          style={{
            backgroundColor: '#1f1f1f',
            color: '#fff',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#333',
          }}
        />
      </View>

      <Pressable
        onPress={handleGenerate}
        disabled={loading}
        style={{
          padding: 16,
          backgroundColor: 'rgb(249 218 71)',
          borderRadius: 12,
          marginBottom: 24,
          opacity: loading ? 0.6 : 1,
        }}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text
            style={{
              color: '#000',
              fontSize: 18,
              fontWeight: '700',
              textAlign: 'center',
            }}>
            Generate Token
          </Text>
        )}
      </Pressable>

      {generatedToken && (
        <View
          style={{
            backgroundColor: '#1f1f1f',
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgb(249 218 71)',
          }}>
          <Text
            style={{
              color: 'rgb(249 218 71)',
              fontSize: 16,
              fontWeight: '700',
              marginBottom: 12,
            }}>
            Generated Token:
          </Text>
          <Text
            style={{
              color: '#fff',
              fontSize: 12,
              fontFamily: 'monospace',
              marginBottom: 16,
            }}
            selectable>
            {generatedToken}
          </Text>
          <Pressable
            onPress={copyToClipboard}
            style={{
              padding: 12,
              backgroundColor: 'rgb(249 218 71)',
              borderRadius: 8,
            }}>
            <Text
              style={{
                color: '#000',
                fontSize: 16,
                fontWeight: '700',
                textAlign: 'center',
              }}>
              Copy to Clipboard
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={() => router.back()}
        style={{
          marginTop: 24,
          padding: 12,
          backgroundColor: '#1f1f1f',
          borderRadius: 8,
        }}>
        <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>
          Back
        </Text>
      </Pressable>
    </ScrollView>
    </SafeAreaView>
  );
}


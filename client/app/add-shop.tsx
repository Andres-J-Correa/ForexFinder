import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useUser } from '@/contexts/UserContext';
import { registerShop } from '@/services/shop-service';
import { handleError } from '@/utils/error-handler';

export default function RegisterShop() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [token, setToken] = useState('');
  const [shopName, setShopName] = useState('');
  const [contact, setContact] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
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

  if (!user) {
    return null;
  }

  const handleSubmit = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter a location token');
      return;
    }

    if (!shopName.trim()) {
      Alert.alert('Error', 'Please enter a shop name');
      return;
    }

    try {
      setLoading(true);
      const shop = await registerShop({
        token: token.trim(),
        shopName: shopName.trim(),
        contact: contact.trim() || undefined,
        hours: hours.trim() || undefined,
      });

      // Clear form fields after successful registration
      setToken('');
      setShopName('');
      setContact('');
      setHours('');

      Alert.alert('Success', 'Shop registered successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Refresh shops list and navigate to rates
            router.replace('/shop/rates');
          },
        },
      ]);
    } catch (error) {
      handleError(
        error,
        'RegisterShop.handleSubmit',
        'Failed to register shop',
      );
      Alert.alert(
        'Error',
        'Failed to register shop. Please check your token and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'rgb(56 56 58)' }}
      contentContainerStyle={{ padding: 16 }}>
      <Text
        style={{
          color: '#fff',
          fontSize: 24,
          fontWeight: '700',
          marginBottom: 8,
        }}>
        Register Your Shop
      </Text>
      <Text style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>
        Enter the location token provided by the admin to register your shop at
        the specified location.
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
          Location Token *
        </Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          placeholder="Enter location token"
          placeholderTextColor="#999"
          style={{
            backgroundColor: '#1f1f1f',
            color: '#fff',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#333',
          }}
          autoCapitalize="none"
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
          Shop Name *
        </Text>
        <TextInput
          value={shopName}
          onChangeText={setShopName}
          placeholder="Enter shop name"
          placeholderTextColor="#999"
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
          Contact Information (optional)
        </Text>
        <TextInput
          value={contact}
          onChangeText={setContact}
          placeholder="Email, phone, etc."
          placeholderTextColor="#999"
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
          Working Hours (optional)
      </Text>
        <TextInput
          value={hours}
          onChangeText={setHours}
          placeholder="e.g., 9am-5pm, Mon-Fri"
          placeholderTextColor="#999"
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
        onPress={handleSubmit}
        disabled={loading}
        style={{
          padding: 16,
          backgroundColor: 'rgb(249 218 71)',
          borderRadius: 12,
          marginBottom: 16,
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
            Register Shop
      </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        style={{
          padding: 12,
          backgroundColor: '#1f1f1f',
          borderRadius: 8,
        }}>
        <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>
          Cancel
        </Text>
      </Pressable>
    </ScrollView>
  );
}

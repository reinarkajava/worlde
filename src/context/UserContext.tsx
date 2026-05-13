import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';

/**
 *  kasutaja kontekst: e-post päise jaoks + sõprade tabi punase täpi loendur.
 */

type UserContextType = {
  userEmail: string;
  fetchUser: () => Promise<void>;
  /** Mitu sõbrakutset on sulle ootel*/
  redButton: number;
  /** Uuenda ootel kutsete arvu —  */
  pokeRedButton: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userEmail, setUserEmail] = useState('');
  const [redButton, setRedButton] = useState(0);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserEmail(user?.email ?? '');
  };

  const pokeRedButton = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      setRedButton(0);
      return;
    }

    const { count, error } = await supabase
      .from('friend_requests')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('status', 'pending');

    if (error) {
      // Kui päring kukub, ei nulli eelmist arvu — muidu täpp vilgub  ja tundub nagu kutse oleks kadunud.
      console.warn('[redButton]', error.message);
      return;
    }

    setRedButton(count ?? 0);
  }, []);

  useEffect(() => {
    void fetchUser();
  }, []);

  useEffect(() => {
    let stop = false;
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id || stop) return;

      await pokeRedButton();

      const channelName = `friend_inbox_${user.id.slice(0, 8)}`;

      realtimeChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friend_requests',
            filter: `receiver_id=eq.${user.id}`,
          },
          () => {
            void pokeRedButton();
          }
        )
        .subscribe();
    })();

    return () => {
      stop = true;
      if (realtimeChannel) void supabase.removeChannel(realtimeChannel);
    };
  }, [pokeRedButton]);

  return (
    <UserContext.Provider
      value={{
        userEmail,
        fetchUser,
        redButton,
        pokeRedButton,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser: komponent peab olema <UserProvider> sees (vt App.tsx).');
  }
  return context;
};

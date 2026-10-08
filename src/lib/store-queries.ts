import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SETTINGS, type MatcherOption, type Product, type StoreSettings } from "./juice-data";

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from("products").select("*").order("id");
    if (error) throw error;
    return data;
  },
});

export const optionsQuery = queryOptions({
  queryKey: ["matcher_options"],
  queryFn: async (): Promise<MatcherOption[]> => {
    const { data, error } = await supabase.from("matcher_options").select("*").order("sort").order("id");
    if (error) throw error;
    return data as MatcherOption[];
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["store_settings"],
  queryFn: async (): Promise<StoreSettings> => {
    const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
    return data ?? DEFAULT_SETTINGS;
  },
});

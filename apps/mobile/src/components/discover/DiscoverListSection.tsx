import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { createNoSearchResultsState, createSuccessState, type FacilityRow } from "sodia-core";
import { TenStateView } from "../common/TenStateView";
import type { DiscoverCoach, DiscoverCommunityClub } from "../../data/discoverData";
import type { UserCoordinates } from "../../services/locationService";
import { DiscoverListRow, type DiscoverListItem } from "./DiscoverListRow";

interface DiscoverListSectionProps {
  facilities: readonly FacilityRow[];
  coaches: readonly DiscoverCoach[];
  clubs: readonly DiscoverCommunityClub[];
  userCoords: UserCoordinates;
  query: string;
  activeFilters: readonly string[];
  header?: React.ReactElement | null;
  onSelectFacility: (fac: FacilityRow) => void;
  onSelectCoach: (coach: DiscoverCoach) => void;
  onSelectClub: (club: DiscoverCommunityClub) => void;
  onResetFilters: () => void;
  onSelectSuggestion: (suggestion: string) => void;
}

/** WRE-seeded fallbacks shown when a search returns nothing. */
const SUGGESTIONS = ["Gym", "Pickleball", "Run Club"] as const;

export function DiscoverListSection(props: DiscoverListSectionProps) {
  const { facilities, coaches, clubs, userCoords } = props;
  const items = useMemo<DiscoverListItem[]>(
    () => [
      ...facilities.map((data): DiscoverListItem => ({ kind: "facility", id: data.id, data })),
      ...coaches.map((data): DiscoverListItem => ({ kind: "coach", id: data.id, data })),
      ...clubs.map((data): DiscoverListItem => ({ kind: "club", id: data.id, data })),
    ],
    [facilities, coaches, clubs]
  );

  const state =
    items.length === 0 ? createNoSearchResultsState<DiscoverListItem[]>(props.query, SUGGESTIONS, props.activeFilters) : createSuccessState(items);

  const onPress = (item: DiscoverListItem) => {
    if (item.kind === "facility") props.onSelectFacility(item.data);
    else if (item.kind === "coach") props.onSelectCoach(item.data);
    else props.onSelectClub(item.data);
  };

  return (
    <View style={styles.flex}>
      {state.status !== "success" ? props.header : null}
      <TenStateView state={state} onClearSearch={props.onResetFilters} onSelectSuggestion={props.onSelectSuggestion}>
        {(list) => (
          <FlashList
            data={list}
            keyExtractor={(i) => `${i.kind}_${i.id}`}
            getItemType={(i) => i.kind}
            renderItem={({ item }) => <DiscoverListRow item={item} userCoords={userCoords} onPress={onPress} />}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            ListHeaderComponent={props.header}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </TenStateView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 8, paddingBottom: 110 },
  sep: { height: 12 },
});

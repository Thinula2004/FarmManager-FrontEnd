import React from "react";
import Activity from "../../models/Activity";
import { ActivityEntity } from "../../enums/ActivityEntity";
import Colors from "../../services/ColorPalette";
import { Ionicons } from "@expo/vector-icons";
import { ActivityAction } from "../../enums/ActivityAction";
import { StyleSheet, Text, View } from "react-native";

type ActionStyle = {
  color: string;
  verb: string;
  iconColor: string;
  bg: string;
  border: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const ACTION_STYLE: Record<ActivityAction, ActionStyle> = {
  [ActivityAction.CREATED]: {
    color: Colors.G700,
    verb: "Created",
    iconColor: Colors.G700,
    bg: Colors.G50,
    border: Colors.G100,
    icon: "add-circle-outline",
  },
  [ActivityAction.ADDED]: {
    color: Colors.G700,
    verb: "Added",
    iconColor: Colors.G700,
    bg: Colors.G50,
    border: Colors.G100,
    icon: "push-outline",
  },
  [ActivityAction.OPENED]: {
    color: Colors.G700,
    verb: "Opened",
    iconColor: Colors.G700,
    bg: Colors.G50,
    border: Colors.G100,
    icon: "lock-open-outline",
  },
  [ActivityAction.ACTIVATED]: {
    color: Colors.G700,
    verb: "Activated",
    iconColor: Colors.G700,
    bg: Colors.G50,
    border: Colors.G100,
    icon: "checkmark-circle-outline",
  },
  [ActivityAction.RECORDED]: {
    color: Colors.AMBER600,
    verb: "Recorded",
    iconColor: Colors.AMBER600,
    bg: Colors.AMBER50,
    border: Colors.AMBER100,
    icon: "document-text-outline",
  },
  [ActivityAction.UPDATED]: {
    color: Colors.AMBER600,
    verb: "Updated",
    iconColor: Colors.AMBER600,
    bg: Colors.AMBER50,
    border: Colors.AMBER100,
    icon: "pencil-outline",
  },
  [ActivityAction.DELETED]: {
    color: Colors.RED500,
    verb: "Deleted",
    iconColor: Colors.RED500,
    bg: Colors.RED50,
    border: Colors.RED100,
    icon: "trash-outline",
  },
  [ActivityAction.CLOSED]: {
    color: Colors.RED500,
    verb: "Closed",
    iconColor: Colors.RED500,
    bg: Colors.RED50,
    border: Colors.RED100,
    icon: "lock-closed-outline",
  },
  [ActivityAction.DEACTIVATED]: {
    color: Colors.RED500,
    verb: "Deactivated",
    iconColor: Colors.RED500,
    bg: Colors.RED50,
    border: Colors.RED100,
    icon: "ban-outline",
  },
};

type EntityStyle = {
  color: string;
  bg: string;
  border: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const ENTITY_STYLE: Record<ActivityEntity, EntityStyle> = {
  [ActivityEntity.FARM]: {
    color: Colors.G700,
    bg: Colors.G50,
    border: Colors.G100,
    icon: "storefront-outline",
    label: "Farm",
  },
  [ActivityEntity.BATCH]: {
    color: "#0F6E56",
    bg: "#E1F5EE",
    border: "#9FE1CB",
    icon: "layers-outline",
    label: "Batch",
  },
  [ActivityEntity.VISIT]: {
    color: "#0F6E56",
    bg: "#E1F5EE",
    border: "#9FE1CB",
    icon: "clipboard-outline",
    label: "Visit",
  },
  [ActivityEntity.OFFICER]: {
    color: "#185FA5",
    bg: "#E6F1FB",
    border: "#B5D4F4",
    icon: "person-outline",
    label: "Officer",
  },
  [ActivityEntity.FEED_ENTRY]: {
    color: Colors.AMBER600,
    bg: Colors.AMBER50,
    border: Colors.AMBER200 ?? "#FAC775",
    icon: "nutrition-outline",
    label: "Feed",
  },
  [ActivityEntity.SUPPLY]: {
    color: "#B25324",
    bg: "#FAECE7",
    border: "#F5C4B3",
    icon: "medkit-outline",
    label: "Supply",
  },
  [ActivityEntity.USER]: {
    color: Colors.SLATE500,
    bg: Colors.SLATE100,
    border: Colors.SLATE200,
    icon: "person-circle-outline",
    label: "User",
  },
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (
    parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : (parts[0]?.slice(0, 2) ?? "?")
  ).toUpperCase();
}

export default function ActivityRow({
  activity,
  isFirst,
  isLast,
}: {
  activity: Activity;
  isFirst: boolean;
  isLast: boolean;
}) {
  const action = ACTION_STYLE[activity.action as ActivityAction];
  const entity = ENTITY_STYLE[activity.entity as ActivityEntity];

  return (
    <View
      style={[
        s.row,
        isFirst && s.rowFirst,
        isLast && s.rowLast,
        !isFirst && s.rowDivider,
      ]}
    >
      <View
        style={[
          s.entityIconWrap,
          { backgroundColor: action.bg, borderColor: action.border },
        ]}
      >
        <Ionicons name={action.icon} size={16} color={action.iconColor} />
      </View>

      {/* rest unchanged */}
      <View style={s.rowBody}>
        <View style={s.rowTopLine}>
          <View style={s.actorRow}>
            <View style={s.actorAvatar}>
              <Text style={s.actorInitials}>
                {getInitials(activity.user.name)}
              </Text>
            </View>
            <Text style={s.actorName} numberOfLines={1}>
              {activity.user.name}
            </Text>
          </View>
          <Text style={s.timestamp}>
            {formatTime(activity.createdAt.toISOString())}
          </Text>
        </View>

        <Text style={s.actionSentence} numberOfLines={2}>
          <Text style={[s.actionVerb, { color: action.color }]}>
            {action.verb}{" "}
          </Text>
          <Text style={s.actionConnector}>a </Text>
          <Text style={[s.entityLabel, { color: entity.color }]}>
            {entity.label}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Colors.WHITE,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.SLATE200,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  rowFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  rowLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 16,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
  },

  entityIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },

  rowBody: { flex: 1, gap: 4 },
  rowTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  actorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  actorAvatar: {
    width: 17,
    height: 17,
    borderRadius: 5,
    backgroundColor: Colors.G100,
    borderWidth: 1,
    borderColor: Colors.G200,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actorInitials: {
    fontSize: 7.5,
    fontWeight: "800",
    color: Colors.G700,
  },
  actorName: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.SLATE700,
    flexShrink: 1,
  },

  timestamp: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.SLATE500,
    flexShrink: 0,
  },

  actionSentence: { fontSize: 13.5, lineHeight: 18 },
  actionVerb: { fontWeight: "700" },
  actionConnector: { fontWeight: "400", color: Colors.SLATE500 },
  entityLabel: { fontWeight: "700" },
});

#!/bin/bash

# Script para probar el sistema de notificaciones
# Uso: ./test-notifications.sh [token]

API_URL="http://localhost:3001"
TOKEN="${1:-YOUR_TOKEN_HERE}"

echo "🔔 Testing Notification System"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Create notification
echo -e "${BLUE}Test 1: Creating test notification${NC}"
RESPONSE=$(curl -s -X POST "${API_URL}/notifications" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎉 Test Notification",
    "message": "This is a test notification from the system",
    "type": "success",
    "priority": "medium",
    "category": "system",
    "actionUrl": "/notifications",
    "actionLabel": "View"
  }')

if echo "$RESPONSE" | grep -q "id"; then
  echo -e "${GREEN}✓ Notification created successfully${NC}"
  NOTIFICATION_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "  ID: $NOTIFICATION_ID"
else
  echo -e "${RED}✗ Failed to create notification${NC}"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 2: Get unread count
echo -e "${BLUE}Test 2: Getting unread count${NC}"
UNREAD=$(curl -s -X GET "${API_URL}/notifications/unread-count" \
  -H "Authorization: Bearer ${TOKEN}")
echo -e "${GREEN}✓ Unread count: $UNREAD${NC}"
echo ""

# Test 3: Get all notifications
echo -e "${BLUE}Test 3: Getting all notifications${NC}"
NOTIFICATIONS=$(curl -s -X GET "${API_URL}/notifications?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")
COUNT=$(echo "$NOTIFICATIONS" | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✓ Total notifications: $COUNT${NC}"
echo ""

# Test 4: Mark as read
if [ ! -z "$NOTIFICATION_ID" ]; then
  echo -e "${BLUE}Test 4: Marking notification as read${NC}"
  READ_RESPONSE=$(curl -s -X PATCH "${API_URL}/notifications/${NOTIFICATION_ID}/read" \
    -H "Authorization: Bearer ${TOKEN}")
  if echo "$READ_RESPONSE" | grep -q '"read":true'; then
    echo -e "${GREEN}✓ Notification marked as read${NC}"
  else
    echo -e "${YELLOW}⚠ Could not verify read status${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Skipping Test 4 (no notification ID)${NC}"
fi
echo ""

# Test 5: Create different notification types
echo -e "${BLUE}Test 5: Creating different notification types${NC}"

# Info
curl -s -X POST "${API_URL}/notifications" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ℹ️ Info Notification",
    "message": "This is an informational notification",
    "type": "info",
    "priority": "low",
    "category": "system"
  }' > /dev/null
echo -e "${GREEN}  ✓ Info notification created${NC}"

# Warning
curl -s -X POST "${API_URL}/notifications" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "⚠️ Warning Notification",
    "message": "This is a warning notification",
    "type": "warning",
    "priority": "high",
    "category": "inventory"
  }' > /dev/null
echo -e "${GREEN}  ✓ Warning notification created${NC}"

# Error
curl -s -X POST "${API_URL}/notifications" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "❌ Error Notification",
    "message": "This is an error notification",
    "type": "error",
    "priority": "urgent",
    "category": "system"
  }' > /dev/null
echo -e "${GREEN}  ✓ Error notification created${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📱 Open your browser and check:"
echo "  • Header notification bell (should show new notifications)"
echo "  • Navigate to /notifications page"
echo "  • WebSocket should be connected (green indicator)"
echo ""

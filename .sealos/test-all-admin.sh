#!/bin/bash
API="https://lv-cube-api-ns-0qkedm1h.cloud.sealos.io"
TOKEN=$(curl -s -X POST ${API}/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

echo "==============================="
echo "  管理后台接口全面测试"
echo "==============================="

test_api() {
  local method=$1
  local path=$2
  local desc=$3
  
  if [ "$method" = "GET" ]; then
    RESP=$(curl -s -w "\n%{http_code}" "${API}${path}" \
      -H "Authorization: Bearer $TOKEN")
  fi
  
  BODY=$(echo "$RESP" | head -n 1)
  CODE=$(echo "$RESP" | tail -n 1)
  
  if [ "$CODE" = "200" ]; then
    RESULT=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'OK code={d[\"code\"]}')" 2>/dev/null)
    if [ -z "$RESULT" ]; then RESULT="OK"; fi
    echo "✅ [$CODE] $desc"
  else
    echo "❌ [$CODE] $desc - ${BODY:0:200}"
  fi
}

echo ""
echo "--- 用户管理 ---"
test_api "GET" "/api/user/list?page=1&pageSize=10" "用户列表"
test_api "GET" "/api/user/pending-suppliers" "待审核供应商"
test_api "GET" "/api/user/pending-drivers" "待审核司机"

echo ""
echo "--- 品类管理 ---"
test_api "GET" "/api/category/tree" "品类树"
test_api "GET" "/api/category" "品类列表"

echo ""
echo "--- 商品管理 ---"
test_api "GET" "/api/product?page=1&pageSize=10" "商品列表"

echo ""
echo "--- 订单管理 ---"
test_api "GET" "/api/order/admin/list?page=1&pageSize=10" "订单列表(管理员)"

echo ""
echo "--- 财务管理 ---"
test_api "GET" "/api/settlement/list?page=1&pageSize=10" "结算记录"
test_api "GET" "/api/settlement/withdrawals?page=1&pageSize=10" "提现审核"

echo ""
echo "--- 退款管理 ---"
test_api "GET" "/api/refund/admin/list?page=1&pageSize=10" "退款管理"

echo ""
echo "--- 配送管理 ---"
test_api "GET" "/api/delivery/admin/list?page=1&pageSize=10" "配送任务"

echo ""
echo "==============================="
echo "  测试完成"
echo "==============================="

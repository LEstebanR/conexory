-- CreateIndex
CREATE INDEX "feedback_userId_idx" ON "feedback"("userId");

-- CreateIndex
CREATE INDEX "properties_userId_idx" ON "properties"("userId");

-- CreateIndex
CREATE INDEX "properties_published_shares_idx" ON "properties"("published", "shares");

-- CreateIndex
CREATE INDEX "properties_published_pinnedAt_createdAt_idx" ON "properties"("published", "pinnedAt", "createdAt");

-- CreateIndex
CREATE INDEX "property_visits_propertyId_idx" ON "property_visits"("propertyId");

-- CreateIndex
CREATE INDEX "users_referredById_idx" ON "users"("referredById");


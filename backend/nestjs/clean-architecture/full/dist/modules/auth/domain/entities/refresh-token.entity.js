"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
class RefreshToken {
    constructor(id, userId, token, expiresAt, deviceInfo, ipAddress, isRevoked, revokedAt, replacedByToken, createdAt) {
        this.id = id;
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
        this.deviceInfo = deviceInfo;
        this.ipAddress = ipAddress;
        this.isRevoked = isRevoked;
        this.revokedAt = revokedAt;
        this.replacedByToken = replacedByToken;
        this.createdAt = createdAt;
    }
    static create(props) {
        return new RefreshToken(0, props.userId, props.token, props.expiresAt, props.deviceInfo ?? null, props.ipAddress ?? null, false, null, null, new Date());
    }
    static reconstitute(id, userId, token, expiresAt, deviceInfo, ipAddress, isRevoked, revokedAt, replacedByToken, createdAt) {
        return new RefreshToken(id, userId, token, expiresAt, deviceInfo, ipAddress, isRevoked, revokedAt, replacedByToken, createdAt);
    }
    revoke(replacedByToken) {
        this.isRevoked = true;
        this.revokedAt = new Date();
        if (replacedByToken) {
            this.replacedByToken = replacedByToken;
        }
    }
    isExpired() {
        return this.expiresAt < new Date();
    }
    isValid() {
        return !this.isRevoked && !this.isExpired();
    }
}
exports.RefreshToken = RefreshToken;
//# sourceMappingURL=refresh-token.entity.js.map
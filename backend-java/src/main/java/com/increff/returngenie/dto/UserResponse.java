package com.increff.returngenie.dto;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.increff.returngenie.model.User;

@JsonAutoDetect(getterVisibility = JsonAutoDetect.Visibility.NONE,
        isGetterVisibility = JsonAutoDetect.Visibility.NONE,
        fieldVisibility = JsonAutoDetect.Visibility.NONE)
public class UserResponse {

    private String id;
    private String username;
    private String clientId;
    private String dbId;
    private String clientName;
    private String themeColor;
    private String role;
    private boolean active;
    private java.util.List<String> marketplaces;

    public static UserResponse from(User user) {
        UserResponse r = new UserResponse();
        r.id = user.getId();
        r.username = user.getUsername();
        r.clientId = user.getClientId();
        r.dbId = user.getDbId();
        r.clientName = user.getClientName();
        r.themeColor = user.getThemeColor();
        r.role = user.getRole();
        r.active = user.isActive();
        r.marketplaces = user.getMarketplaces();
        return r;
    }

    @JsonProperty("_id")
    public String getId() {
        return id;
    }

    @JsonProperty("username")
    public String getUsername() {
        return username;
    }

    @JsonProperty("clientId")
    public String getClientId() {
        return clientId;
    }

    @JsonProperty("dbId")
    public String getDbId() {
        return dbId;
    }

    @JsonProperty("clientName")
    public String getClientName() {
        return clientName;
    }

    @JsonProperty("themeColor")
    public String getThemeColor() {
        return themeColor;
    }

    @JsonProperty("role")
    public String getRole() {
        return role;
    }

    @JsonProperty("isActive")
    public boolean isActive() {
        return active;
    }

    @JsonProperty("marketplaces")
    public java.util.List<String> getMarketplaces() {
        return marketplaces;
    }
}

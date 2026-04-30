package com.increff.returngenie.dto;

public class CreateClientRequest {

    private String username;
    private String password;
    private String clientName;
    private String themeColor;
    private String pod;
    private String dbId;
    private java.util.List<String> marketplaces;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getThemeColor() {
        return themeColor;
    }

    public void setThemeColor(String themeColor) {
        this.themeColor = themeColor;
    }

    public String getPod() {
        return pod;
    }

    public void setPod(String pod) {
        this.pod = pod;
    }

    public String getDbId() {
        return dbId;
    }

    public void setDbId(String dbId) {
        this.dbId = dbId;
    }

    public java.util.List<String> getMarketplaces() {
        return marketplaces;
    }

    public void setMarketplaces(java.util.List<String> marketplaces) {
        this.marketplaces = marketplaces;
    }
}

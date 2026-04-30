package com.increff.returngenie.dto;

import java.util.List;

public class UpdateClientRequest {

    private String password;
    private List<String> marketplaces;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<String> getMarketplaces() {
        return marketplaces;
    }

    public void setMarketplaces(List<String> marketplaces) {
        this.marketplaces = marketplaces;
    }
}

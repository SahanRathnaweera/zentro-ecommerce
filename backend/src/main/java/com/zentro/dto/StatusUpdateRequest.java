package com.zentro.dto;

import com.zentro.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private OrderStatus status;
}

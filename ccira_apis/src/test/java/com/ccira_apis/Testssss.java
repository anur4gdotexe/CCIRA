package com.ccira_apis;

import net.bytebuddy.asm.Advice;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class Testssss {
    public static void main (String[] args) {
        System.out.println("\n\n\n\ndate: " + LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS).toString());
    }
}

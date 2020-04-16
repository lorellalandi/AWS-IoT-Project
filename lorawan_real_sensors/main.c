/*
 * Copyright (C) 2018 Inria
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

#include <string.h>

#include "xtimer.h"

#include "net/loramac.h"
#include "semtech_loramac.h"

#include "hts221.h"
#include "hts221_params.h"

#include "board.h"

/* Declare globally the loramac descriptor */
static semtech_loramac_t loramac;

/* Declare globally the sensor device descriptor */
static hts221_t hts221;

/* Device and application informations required for OTAA activation */
static uint8_t deveui[LORAMAC_DEVEUI_LEN]= { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }; // TTN device EUI
static uint8_t appeui[LORAMAC_APPEUI_LEN]= { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }; // TTN applicaiton EUI
static uint8_t appkey[LORAMAC_APPKEY_LEN]= { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }; //TTN device application key

static void sender(void)
{
    while (1) {
        char message[200];
        /* Sleep 20 secs */
        xtimer_sleep(20);

        /* Measure humidity and temperature */
        uint16_t humidity = 0;
        int16_t temperature = 0;
        if (hts221_read_humidity(&hts221, &humidity) != HTS221_OK) {
            puts(" -- failed to read humidity!");
        }
        if (hts221_read_temperature(&hts221, &temperature) != HTS221_OK) {
            puts(" -- failed to read temperature!");
        }

        /* Message to be published */
        sprintf(message, "{\"id\": \"1\", \"timestamp\": \"-\", \"temperature\": \"%u.%u\", \"humidity\": \"%u.%u\", \"windDirection\": \"-\", \"windIntensity\": \"-\", \"rainHeight\": \"-\"}", (temperature / 10), (temperature % 10), (humidity / 10), (humidity % 10));
        printf("Sending data: %s\n", message);

        /* Send the LoRaWAN message */
        uint8_t ret = semtech_loramac_send(&loramac, (uint8_t *)message,
                                           strlen(message));
        if (ret != SEMTECH_LORAMAC_TX_DONE) {
            printf("Cannot send message '%s', ret code: %d\n", message, ret);
        }
    }

    /* This should never be reached */
    return;
}

int main(void)
{
    if (hts221_init(&hts221, &hts221_params[0]) != HTS221_OK) {
        puts("Sensor initialization failed");
        LED3_TOGGLE;
        return 1;
    }
    if (hts221_power_on(&hts221) != HTS221_OK) {
        puts("Sensor initialization power on failed");
        LED3_TOGGLE;
        return 1;
    }
    if (hts221_set_rate(&hts221, hts221.p.rate) != HTS221_OK) {
        puts("Sensor continuous mode setup failed");
        LED3_TOGGLE;
        return 1;
    }

    /* Initialize the loramac stack */
    semtech_loramac_init(&loramac);

    /* Use a fast datarate so we don't use the physical layer too much */
    semtech_loramac_set_dr(&loramac, 5);

    /* Set the LoRaWAN keys */
    semtech_loramac_set_deveui(&loramac, deveui);
    semtech_loramac_set_appeui(&loramac, appeui);
    semtech_loramac_set_appkey(&loramac, appkey);

    /* Start the OTAA join procedure */
    puts("Starting join procedure");
    if (semtech_loramac_join(&loramac, LORAMAC_JOIN_OTAA) != SEMTECH_LORAMAC_JOIN_SUCCEEDED) {
        puts("Join procedure failed");
        return 1;
    }

    puts("Join procedure succeeded");

    /* Call the sender */
    sender();

    /* This should never be reached */
    return 0;
}


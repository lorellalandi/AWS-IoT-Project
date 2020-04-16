/*
 * Copyright (C) 2018 Inria
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/**
 * @ingroup     examples
 * @{
 *
 * @file
 * @brief       Example demonstrating the use of LoRaWAN with RIOT
 *
 * @author      Alexandre Abadie <alexandre.abadie@inria.fr>
 *
 * @}
 */

#include <string.h>
#include <time.h>
#include "xtimer.h"
#include "net/loramac.h"
#include "semtech_loramac.h"
#include "board.h"

semtech_loramac_t loramac;

static uint8_t deveui[LORAMAC_DEVEUI_LEN]= { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }; // TTN device EUI
static uint8_t appeui[LORAMAC_APPEUI_LEN]= { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }; // TTN applicaiton EUI
static uint8_t appkey[LORAMAC_APPKEY_LEN]= { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }; //TTN device application key

/* Generate random value */
int get_random_value(int min, int max) { 
    return rand()%((max * 100) - (min * 100) + 1) + (min * 100);
}

static void sender(void)
{
    srand(time(0));
    while (1) {
        
        /* Wait 20 secs */
        xtimer_sleep(20);

        /*
        temperature (-50 ... 50 Celsius)
        humidity (0 ... 100%)
        wind direction (0 ... 360 degrees)
        wind intensity (0 ... 100 m/s)
        rain haight (0 ... 50 mm/h)
        */
        int temp = get_random_value(-50, 50);
        int tempDecimal = get_random_value(0, 50);
        int hum = get_random_value(0, 100);
        int windDir = get_random_value(0, 360);
        int windInt = get_random_value(0, 100);
        int rainHeig = get_random_value(0, 50);        

        /* Message to be published */
        char message[200];
        sprintf(message, "{\"id\": \"1\", \"timestamp\": \"\", \"temperature\": \"%d.%d\", \"humidity\": \"%d.%d\", \"windDirection\": \"%d.%d\", 
        \"windIntensity\": \"%d.%d\", \"rainHeight\": \"%d.%d\"}", (temp / 100), (tempDecimal % 100), (hum / 100), (hum % 100), (windDir / 100), 
        (windDir % 100), (windInt / 100), (windInt % 100), (rainHeig / 100), (rainHeig % 100));

        /* Send the LoRaWAN message */
        printf("Sending message: %s\n", message);
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
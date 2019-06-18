// Assignment 14: Polish a Story Game by Allison Steeves and Lisa Liao
// Music and sound effects for The Metamorphosis created by Ryan X. Messcher.

// The Metamorphosis is a horror story game based on Franz Kafka's novella of the same name.
// The player plays as Grete who must evade her brother, Gregor, who has been turned into a giant insect.
// There are five levels that get progressively get more difficult where the player must collect coins.
// With each step, Gregor moves closer to the player, with the exception of the last level where Gregor moves on a timer.
// The player can reset Gregor and drop off coins by entering the hall, a safe zone where the player can talk to NPCs.
// After completing the last level, an emotional ending sequence where Gregor fades away and dies is played.

// Source Code:

// Global namespace variable G
var G = ( function() {

    // Constants

    // Database Constants

    var COLLECT_DATA = false; // Should be set to true if data is being collected, false if not
    var DATABASE = "metamorphosis_final"; // Database string id
    var EMAIL = "aesteeves"; // Email to send data to

    // Grid Setup Constants

    var GRID_WIDTH = 31; // Width of grid
    var GRID_HEIGHT = 31; // Height of grid

    var PLANE_SPRITE_LAYOUT = 1; // Plane for house layout sprite
    var PLANE_SPRITE_MOVEMENT = 2; // Plane for player and Gregor sprites

    // Color Constants

    var COLOR_PLAYER = 0xE0B2A1; // Color of player (Grete)
    var COLOR_GREGOR = 0x8E710C; // Color of Gregor
    var COLOR_MOM = 0x7E562C; // Color of mom NPC
    var COLOR_DAD = 0xCE906D; // Color of dad NPC
    var COLOR_COIN = 0xFF9900; // Color of coins
    var COLOR_COIN_EMPTY = 0x333333; // Color of empty coin space in inventory
    var COLOR_GLYPH = 0xFF9900; // Color of number glyphs on coin counter
    var COLOR_OBSTACLE = 0x000000; // Color of impassable walls/obstacles
    var COLOR_FLOOR = 0x382B23; // Color of floor
    var COLOR_GATE = 0x665647; // Color of gate that connects house and hall
    var COLOR_STATUS_HALL = 0xC69C6D; // Color of status line in hall
    var COLOR_STATUS_HOUSE = 0x9A841C; // Color of status line in house
    var COLOR_SHADOW_HALL = 0x88725F; // Color of grid shadow in hall
    var COLOR_SHADOW_HOUSE = 0x000000; // Color of grid shadow in house

    var FADE_RATE = 60; // Color fade rate (1 second)

    var RADIUS_PLAYER = 0; // Radius of player
    var RADIUS_COIN = 50; // Radius of coins

    // Sound Constants

    // Sound file names
    var MUSIC_FAST_ALL = "layer_01"; // Fast background music
    var MUSIC_FAST_HOUSE = "layer_02"; // Music layer that is added to background fast music when the player is in the house
    var MUSIC_SLOW_ALL = "start_layer_01"; // Slow background music
    var MUSIC_SLOW_HOUSE = "start_layer_02"; // Music layer that is added to background slow music when the player is in the house
    var MUSIC_ENDING = "ending"; // Music that plays during the ending sequence

    var SFX_COIN_PICKUP = "coin_pickup"; // Sound effect for coin pickup
    var SFX_COIN_ERROR = "coin_error"; // Sound effect for inventory full error message
    var SFX_COIN_DROPOFF = "coin_dropoff"; // Sound effect for coins dropped off in hall
    var SFX_OBSTACLE_ERROR = "obstacle"; // Sound effect for player trying to move onto obstacle
    var SFX_GREGOR_SKITTER_1 = "gregor_step_01"; // Sound effect for Gregor movement (variation 1)
    var SFX_GREGOR_SKITTER_2 = "gregor_step_02"; // Sound effect for Gregor movement (variation 2)
    var SFX_GREGOR_SKITTER_3 = "gregor_step_03"; // Sound effect for Gregor movement (variation 3)
    var SFX_GREGOR_SKITTER_4 = "gregor_step_04"; // Sound effect for Gregor movement (variation 4)
    var SFX_GREGOR_SKITTER_5 = "gregor_step_05"; // Sound effect for Gregor movement (variation 5)
    var SFX_GREGOR_SKITTER_6 = "gregor_step_06"; // Sound effect for Gregor movement (variation 6)
    var SFX_STINGER = "level_end"; // Sound effect for level completion
    var SFX_CAUGHT = "caught"; // Sound effect for when player is caught by Gregor/level resets

    var LINE_MOM = "mom_new"; // Sigh when player talks to mom
    var LINE_DAD = "dad"; // Grunt when player talks to dad
    var LINE_GREGOR_LV1 = "gregor_line_01"; // Gregor dialogue for first level
    var LINE_GREGOR_LV2 = "gregor_line_02"; // Gregor dialogue for second level
    var LINE_GREGOR_LV3 = "gregor_line_03"; // Gregor dialogue for third level
    var LINE_GREGOR_LV4 = "gregor_line_04"; // Gregor dialogue for fourth level
    var LINE_GREGOR_LV5 = "gregor_line_05"; // Gregor dialogue for fifth level
    var LINE_GREGOR_END1 = "gregor_line_06"; // First Gregor line during ending
    var LINE_GREGOR_END2 = "gregor_line_07"; // Second Gregor line during ending
    var LINE_GREGOR_END3 = "gregor_line_08"; // Third Gregor line during ending
    var LINE_GREGOR_END4 = "gregor_line_09"; // Fourth Gregor line during ending

    // Volumes for sounds
    var VOLUME_SFX = .75; // Volume of sound effects
    var VOLUME_MUSIC_FAST = .3; // Volume of fast music
    var VOLUME_MUSIC_SLOW = .75; // Volume of slow music
    var VOLUME_MUSIC_ENDING = .5; // Volume of ending music

    var START_MUSIC_FADE_RATE = 5000; // Fade rate for start of slow music (5 seconds)
    var HOUSE_MUSIC_FADE_RATE = 1000; // Fade rate for house music (1 second)
    var TRANSITION_MUSIC_FADE_RATE = 3000; // Fade rate for crossfade between slow and fast music (3 seconds)
    var END_MUSIC_FADE_RATE = 2000; // Fade rate for fast music at the end (2 seconds)
    var SOUND_PATH = "sounds/"; // Path for all custom sounds

    var LEVEL_MUSIC_FAST_START = 3; // Level number where fast music starts playing (instead of slow)
    var LEVEL_MUSIC_SLOW_START = 1; // Level number where slow music starts playing (instead of no music)

    // PATH_MAP/Movement Constants

    var VALUE_FLOOR = 1; // Number id for normal floor (in PATH_MAP)
    var VALUE_OBSTACLE = 0; // Number id for impassable obstacles (in PATH_MAP)
    var VALUE_COIN_UI = 2; // Number id for coin UI elements (in PATH_MAP)
    var VALUE_GREGOR_NO_MOVE = 9; // Number id for floor where Gregor's center pixel cannot move, but player can (in PATH_MAP)

    var MOVE_RATE = 15; // Move rate for Gregor during last level (moves once every 15 frames)

    var FLOOR_ID = "floor"; // String id for beads that are only floors
    var OBSTACLE_ID = "obstacle"; // String id for obstacle beads
    var MOM_ID = "mom"; // String id for mom NPC
    var DAD_ID = "dad"; // String id for dad NPC
    var COIN_ID = "coin"; // String id for coin that can be picked up

    var GATE_Y = 26; // y-value for all gate coordinates

    // Area ids used to determine which area is colored black ("not visible" to player)
    var HALL = "hall"; // Refers to all coordinates with y values greater than GATE_Y
    var HOUSE = "house"; // Refers to all coordinates with x values less than GATE_Y

    // This image map is used for Gregor pathfinding logic and player movement
    // 0 indicates an obstacle that neither the player nor Gregor can traverse
    // 1 indicates a walkable path for both the player and Gregor
    // 2 indicates a coin UI element (should never be reachable, i.e. connected to a "1")
    // 9 indicates a walkable path for the player, but not Gregor's center
    // No 0 should ever be connected to a 1 (adjacent or diagonal), only 9s for Gregor sprite movement
    var PATH_MAP = {
        width : 31, height : 31, pixelSize : 1,
        data : [
            0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,
            0,	0,	0,	9,	9,	9,	9,	9,	9,	9,	0,	9,	9,	9,	9,	9,	9,	9,	9,	0,	0,	0,	0,	0,	9,	0,	0,	0,	0,	0,	0,
            0,	0,	0,	9,	0,	9,	9,	9,	0,	0,	0,	0,	0,	9,	1,	1,	1,	1,	9,	0,	0,	0,	0,	9,	9,	0,	0,	0,	0,	0,	0,
            0,	0,	0,	9,	0,	9,	9,	9,	9,	9,	0,	0,	0,	9,	1,	1,	1,	1,	9,	9,	9,	9,	9,	9,	9,	9,	9,	0,	0,	0,	0,
            0,	9,	9,	9,	9,	9,	9,	9,	9,	0,	0,	0,	0,	9,	1,	1,	1,	1,	1,	9,	0,	0,	9,	1,	1,	1,	9,	0,	0,	0,	0,
            0,	9,	9,	9,	9,	9,	9,	9,	9,	9,	0,	9,	9,	9,	1,	1,	1,	1,	1,	9,	9,	9,	9,	1,	1,	1,	9,	9,	9,	9,	0,
            0,	9,	9,	9,	9,	9,	9,	9,	9,	9,	0,	9,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	9,	0,
            0,	9,	0,	0,	0,	9,	0,	9,	9,	9,	0,	9,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	9,	0,
            0,	0,	0,	0,	0,	0,	0,	0,	9,	9,	0,	9,	1,	1,	1,	9,	9,	9,	1,	1,	1,	1,	1,	1,	1,	1,	9,	9,	9,	9,	0,
            0,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	1,	1,	1,	9,	0,	9,	1,	1,	1,	1,	1,	1,	1,	1,	9,	0,	0,	0,	0,
            0,	0,	0,	9,	0,	9,	1,	1,	1,	1,	1,	1,	1,	1,	9,	9,	0,	9,	1,	9,	9,	9,	1,	1,	9,	9,	9,	9,	9,	0,	0,
            0,	0,	0,	9,	9,	9,	1,	1,	1,	1,	1,	1,	1,	1,	9,	0,	0,	9,	1,	9,	0,	9,	1,	1,	9,	0,	9,	9,	9,	0,	0,
            0,	0,	0,	9,	0,	9,	1,	1,	1,	1,	1,	1,	1,	1,	9,	0,	0,	9,	9,	9,	9,	9,	9,	1,	9,	0,	9,	9,	9,	0,	0,
            0,	0,	9,	9,	9,	9,	9,	9,	9,	1,	1,	1,	1,	1,	9,	9,	0,	0,	9,	0,	0,	0,	9,	9,	9,	0,	0,	0,	0,	0,	0,
            0,	0,	0,	0,	0,	0,	0,	0,	9,	1,	1,	1,	1,	1,	1,	9,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,
            0,	9,	9,	9,	9,	9,	9,	9,	9,	1,	1,	9,	9,	9,	1,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	0,	0,
            0,	9,	9,	9,	9,	9,	9,	1,	1,	1,	1,	9,	0,	9,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	9,	0,	0,
            0,	0,	0,	0,	0,	0,	9,	1,	9,	9,	9,	9,	9,	9,	1,	1,	1,	1,	9,	9,	9,	1,	1,	9,	9,	9,	9,	9,	9,	0,	0,
            0,	0,	0,	0,	0,	0,	9,	1,	9,	0,	9,	0,	0,	9,	9,	9,	1,	1,	9,	0,	9,	9,	9,	9,	0,	0,	9,	9,	9,	9,	0,
            0,	0,	0,	9,	9,	9,	9,	9,	9,	9,	9,	0,	0,	9,	0,	9,	1,	9,	9,	0,	9,	9,	0,	9,	0,	0,	9,	0,	9,	9,	0,
            0,	0,	0,	9,	9,	0,	9,	0,	9,	1,	9,	9,	9,	9,	9,	9,	1,	9,	0,	0,	9,	9,	9,	9,	0,	0,	9,	9,	9,	0,	0,
            0,	0,	0,	9,	9,	0,	9,	9,	9,	1,	9,	0,	9,	1,	1,	1,	1,	9,	9,	0,	9,	9,	0,	9,	0,	0,	9,	0,	9,	9,	0,
            0,	0,	0,	9,	9,	0,	9,	0,	9,	1,	9,	9,	9,	1,	1,	1,	1,	1,	9,	0,	9,	9,	9,	9,	0,	0,	9,	9,	9,	9,	0,
            0,	0,	0,	9,	9,	9,	9,	9,	9,	1,	1,	1,	1,	1,	1,	1,	1,	1,	9,	9,	9,	1,	1,	9,	9,	9,	9,	1,	9,	0,	0,
            0,	0,	0,	0,	0,	0,	0,	0,	9,	9,	9,	9,	9,	9,	9,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	9,	0,	0,
            0,	0,	0,	0,	0,	0,	0,	0,	9,	0,	9,	9,	0,	0,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	0,	0,
            0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	9,	9,	9,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,
            0,	0,	2,	0,	0,	2,	0,	0,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	0,	0,	0,	0,	0,	0,	0,	0,
            0,	0,	0,	0,	0,	0,	0,	0,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	0,	0,	2,	0,	0,	0,	0,	0,
            0,	0,	2,	0,	0,	2,	0,	0,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	9,	0,	0,	0,	0,	0,	0,	0,	0,
            0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,

        ]
    };

    // Coin Inventory/Counter UI Constants

    // Coordinates for UI coin inventory (in order they are "filled")
    var COIN_INVENTORY_1 = [ 2, 27 ];
    var COIN_INVENTORY_2 = [ 5, 27 ];
    var COIN_INVENTORY_3 = [ 2, 29 ];
    var COIN_INVENTORY_4 = [ 5, 29 ];

    var INVENTORY_MAX = 4; // Maximum number of coins that player can have in inventory at once

    // Coordinates for coin symbol in dropped off coin counter
    var COIN_COUNTER_X = 25;
    var COIN_COUNTER_Y = 28;

    var GLYPH_Y = 28; // y-coordinate for all glyphs in coin counter

    var NUM_GLYPH_ONES_X = 28; // x-coordinate of ones' place number glyph for counter (number held in num_glyph_ones variable)
    var NUM_GLYPH_TENS_X = 27; // x-coordinate of tens' place number glyph for counter (number held in num_glyph_tens variable)

    var X_GLYPH = "X"; // "X" glyph string for coin counter
    var X_GLYPH_X = 26; // x-coordinate for "X" glyph part of coin counter

    // Status line constants

    var STATUS_FAIL = "You fainted. Try again."; // Display if player collides with Gregor
    var STATUS_INVENTORY_1 = "Inventory: 1/4"; // Display if player has 1 coin in inventory
    var STATUS_INVENTORY_2 = "Inventory: 2/4"; // Display if player has 2 coins in inventory
    var STATUS_INVENTORY_3 = "Inventory: 3/4"; // Display if player has 3 coins in inventory
    var STATUS_INVENTORY_4 = "Inventory: 4/4 - FULL"; // Display if player has 4 coins in inventory
    var STATUS_INVENTORY_FULL = "You can't carry more coins."; // Display if player tries to pick up coin when inventory is full
    var STATUS_CHECK_PARENTS = "Check in with your parents."; // Display if player tries to exit hall before talking to parents
    var STATUS_ENDING_1 = "\"I can't go on, Grete.\""; // Gregor end scene line 1
    var STATUS_ENDING_2 = "\"This form... is killing me...\""; // Gregor end scene line 2
    var STATUS_ENDING_3 = "\"Live well, my little sister...\""; // Gregor end scene line 3
    var STATUS_ENDING_4 = "\"I... love... you...\""; // Gregor end scene line 4

    var ENDING_STATUS_TOTAL = 4; // Total number of ending status lines (used for calculating jumps in transparency)

    // Variables

    var user = null; // Name of user currently playing (from dbInit() input)
    var play = false; // True if player has put in username
    var level = 0; // Keeps track of current level (starts at Level 0)
    var level_first_load = true; // True if it's the first load the current level (false if level was ever restarted)

    var id_music_fast_all = ""; // Variable for saving channel id for fast music
    var id_music_fast_house = ""; // Variable for saving channel id for fast music layer that only plays when in the house
    var id_music_slow_all = ""; // Variable for saving channel id for slow music
    var id_music_slow_house = ""; // Variable for saving channel id for slow music layer that only plays when in the house

    var seen_mom_status = false; // True if player has seen primary Mom status line for current level yet
    var seen_dad_status = false; // True if player has seen primary Dad status line for current level yet

    var endgame = false; // True if the player has reached the end of the game
    var end_frames = 0; // Keeps track of how many frames have passed since ending sequence started
    var end_timer = null; // Timer for ending sequence
    var gregor_timer = null; // Timer for Gregor movement during last level

    var path_id; // Pathmap id for pathfinding

    var sprite_player_id; // Sprite id for player bead
    var sprite_gregor_id; // Sprite id for Gregor
    var sprite_layout_id; // Sprite id for loading in layout sprite

    var player_x; // Current x position of player
    var player_y; // Current y position of player
    var player_location = HALL; // Keeps track if player is currently in HALL or HOUSE (HALL to start)
    var player_steps = 0; // Number of steps player has taken in house

    var gregor_x; // Current x position of Gregor center bead (for pathfinding)
    var gregor_y; // Current y position of Gregor center bead (for pathfinding)
    var gregor_sprite_x; // Current x position of Gregor sprite for calling PS.spriteMove (gregor_x - 1)
    var gregor_sprite_y; // Current y position of Gregor sprite for calling PS.spriteMove (gregor_y -1)
    var gregor_move_rate; // Current movement rate of Gregor (moves once for every specified number of player steps)
    var gregor_skitter_count = 1; // Keeps track of which Gregor skitter sound to play during movement

    var num_glyph_ones = "0"; // Glyph for current value of ones' place in coin counter (0 to start)
    var num_glyph_tens = "0"; // Glyph for current value of tens' place in coin counter (0 to start)

    // Array of coordinates for coin inventory
    var coin_inventory = [
        COIN_INVENTORY_1, COIN_INVENTORY_2, COIN_INVENTORY_3, COIN_INVENTORY_4
    ];

    var inventory_count = 0; // Keeps track of how many coins are in inventory (four max)
    var coin_counter = 0; // Keeps track of how many coins have been dropped off for the current level
    var total_coins = 0; // Keeps track of how many coins have been collected overall (and are displayed on the counter)
    var total_coin_win = null; // Total coins needed beat current level

    // Status line variables (saved at start of each level) used for displaying dialogue
    var mom_status_primary = ""; // Primary mom status line that player MUST see
    var mom_status_secondary_1 = ""; // Secondary mom status line that is shown after mom_status_primary
    var mom_status_secondary_2 = ""; // Secondary mom status line that is shown after mom_status_secondary_1
    var dad_status_primary = ""; // Primary dad status line that player MUST see
    var dad_status_secondary_1 = ""; // Secondary dad status line that is shown after dad_status_primary
    var dad_status_secondary_2 = ""; // Secondary dad status line that is shown after dad_status_secondary_1
    var gregor_status = ""; // Gregor status line for when player enters the house

    var next_status_mom = ""; // Keeps track of next status line to be displayed when mom is talked to
    var next_status_dad = ""; // Keeps track of next status line to be displayed when dad is talked to

    var gregor_line = ""; // Gregor dialogue line to be played when player enters house on current level

    // Array of objects that contains initialization data for each level
    // player_x, player_y = starting position of player
    // gregor_x, gregor_y = starting position of Gregor
    // mom_x, mom_y = starting position of mom
    // dad_x, dad_y = starting position of dad
    // coins = list of coins: [ x, y ]
    // gregor_move_rate = movement rate of Gregor (moves once for every specified number of player steps) for level
    // start_status = status line to be displayed at start of level
    // mom_status_primary = primary status line text for mom this level
    // mom_status_secondary_1 = first secondary status line text for mom this level
    // mom_status_secondary_2 = second secondary status line text for mom this level
    // dad_status_primary = primary status line text for dad this level
    // dad_status_secondary_1 = first secondary status line text for dad this level
    // dad_status_secondary_2 = second secondary status line text for dad this level
    // gregor_status = status line text for Gregor this level
    // gregor_line = Gregor dialogue line to be played this level
    var level_data = [

        // Level 0
        {
            player_x : 15, player_y : 28,
            gregor_x : 16, gregor_y : 2,
            mom_x : 11, mom_y : 28,
            dad_x : 19, dad_y : 28,
            coins: [
                [ 1, 15 ], [ 3, 23 ], [ 6, 4 ], [ 23, 20 ]
            ],
            gregor_move_rate : 20,
            start_status : "Welcome home, child...",
            mom_status_primary : "\"Darling, where is your brother?\"",
            mom_status_secondary_1 : "\"He's always keeping to himself...\"",
            mom_status_secondary_2 : "\"I hope everything is okay.\"",
            dad_status_primary : "\"Our savings are running out...\"",
            dad_status_secondary_1 : "\"Gregor hasn't been working enough.\"",
            dad_status_secondary_2 : "\"What a lazy son...\"",
            gregor_status : "\"...\"",
            gregor_line : LINE_GREGOR_LV1
        },

        // Level 1
        {
            player_x : 15, player_y : 28,
            gregor_x : 23, gregor_y : 12,
            mom_x : 12, mom_y : 28,
            dad_x : 20, dad_y : 28,
            coins: [
                [ 3, 21 ], [ 1, 9 ], [ 1, 7 ], [ 18, 13 ], [ 21, 3 ], [ 12, 17 ]
            ],
            gregor_move_rate : 8,
            start_status : "They don't know yet...",
            mom_status_primary : "\"I'm so worried about Gregor...\"",
            mom_status_secondary_1 : "\"Do you think he's alright?\"",
            mom_status_secondary_2 : "\"Did you find him?\"",
            dad_status_primary : "\"Where'd you get that money?\"",
            dad_status_secondary_1 : "\"Can you get even more?\"",
            dad_status_secondary_2 : "\"We'll be okay after all!\"",
            gregor_status : "\"Grete... it's me...\"",
            gregor_line : LINE_GREGOR_LV2
        },

        // Level 2
        {
            player_x : 15, player_y : 28,
            gregor_x : 28, gregor_y : 7,
            mom_x : 8, mom_y : 27,
            dad_x : 18, dad_y : 28,
            coins: [
                [ 11, 1 ], [ 3, 16 ], [ 28, 12 ], [ 9, 3 ], [ 28, 15 ], [ 20, 3 ], [ 10, 18 ], [ 3, 12 ]
            ],
            gregor_move_rate : 5,
            start_status : "Something's happened to Gregor...",
            mom_status_primary : "\"W-w-what were all those noises?!\"",
            mom_status_secondary_1 : "\"I think something's happened...\"",
            mom_status_secondary_2 : "\"This doesn't feel right...\"",
            dad_status_primary : "\"We're gonna be rich, sweetie!!!\"",
            dad_status_secondary_1 : "\"Ah Grete... my darling moneymaker!\"",
            dad_status_secondary_2 : "\"I'm so proud of you!\"",
            gregor_status : "\"Please... help me, Grete...\"",
            gregor_line : LINE_GREGOR_LV3
        },

        // Level 3
        {
            player_x : 15, player_y : 28,
            gregor_x : 18, gregor_y : 24,
            mom_x : 13, mom_y : 29,
            dad_x : 17, dad_y : 27,
            coins: [
                [ 1, 7 ], [ 20, 12 ], [ 24, 1 ], [ 1, 9 ], [ 28, 10 ], [ 18, 13 ], [ 8, 25 ], [ 3, 19 ]
            ],
            gregor_move_rate : 3,
            start_status : "He's become a monster.",
            mom_status_primary : "\"We need to leave now!\"",
            mom_status_secondary_1 : "\"Something must've got Gregor!\"",
            mom_status_secondary_2 : "\"We'll be next!!!\"",
            dad_status_primary : "\"We can't leave without Gregor!\"",
            dad_status_secondary_1 : "\"He needs to help us!\"",
            dad_status_secondary_2 : "\"Grete, go find him!\"",
            gregor_status : "\"Why do you run...?\"",
            gregor_line : LINE_GREGOR_LV4
        },

        // Level 4
        {
            player_x : 15, player_y : 28,
            gregor_x : 24, gregor_y : 24,
            mom_x : 13, mom_y : 29,
            dad_x : 17, dad_y : 27,
            coins: [
                [ 28, 12 ], [ 10, 18 ], [ 12, 17 ], [ 13, 19 ], [ 11, 20 ], [ 27, 20 ], [ 22, 20 ], [ 12, 1 ], [ 1, 4 ], [ 9, 3 ], [ 11, 25 ]
            ],
            gregor_move_rate : null,
            start_status : "There's nothing left of him.",
            mom_status_primary : "\"That THING is coming!!!\"",
            mom_status_secondary_1 : "\"Please... we must go!!!\"",
            mom_status_secondary_2 : "\"I don't wanna die here!\"",
            dad_status_primary : "\"We'll die without his money!\"",
            dad_status_secondary_1 : "\"Don't you dare leave, Grete!\"",
            dad_status_secondary_2 : "\"I won't stand for this!\"",
            gregor_status : "\"COME HERE!\"",
            gregor_line : LINE_GREGOR_LV5
        }

    ];

    // Private Functions

    // Everything that should happen during PS.init(), regardless of data collection being on/off
    function initStart() {

        // Load in house layout sprite
        PS.imageLoad( "sprite_layout.png", spriteLayoutLoader );

        // Create Gregor sprite
        spriteGregorCreate();

        // Load in fast music
        PS.audioLoad( MUSIC_FAST_ALL, {
            lock : true,
            onLoad : loadMusicFastAll,
            path : SOUND_PATH
        } );

        // Load in house fast music layer
        PS.audioLoad( MUSIC_FAST_HOUSE, {
            lock : true,
            onLoad : loadMusicFastHouse,
            path : SOUND_PATH
        } );

        // Load in slow music
        PS.audioLoad( MUSIC_SLOW_ALL, {
            lock : true,
            onLoad : loadMusicSlowAll,
            path : SOUND_PATH
        } );

        // Load in house slow music layer
        PS.audioLoad( MUSIC_SLOW_HOUSE, {
            lock : true,
            onLoad : loadMusicSlowHouse,
            path : SOUND_PATH
        } );

        // Load in ending music
        PS.audioLoad( MUSIC_ENDING, { path : SOUND_PATH, lock : true, volume : VOLUME_MUSIC_ENDING } );

        // Create player sprite
        sprite_player_id = PS.spriteSolid( 1, 1 );
        PS.spriteSolidColor( sprite_player_id, COLOR_PLAYER );
        PS.spritePlane( sprite_player_id, PLANE_SPRITE_MOVEMENT ); // Draw on sprite plane
        PS.spriteCollide( sprite_player_id, gregorCollide ); // Set up Gregor collide function

        PS.gridSize( GRID_WIDTH, GRID_HEIGHT ); // Dimensions of grid
        PS.statusFade( FADE_RATE ); // Set up fade rate for status line
        PS.border( PS.ALL, PS.ALL, 0 ); // Turn off borders for all beads

        // Create pathmap id from PATH_MAP for pathfinding
        path_id = PS.pathMap( PATH_MAP );

        // Set up coin UI
        setUpUI();

        startLevel( level );
    }

    // Gets player username for database, sets play to true, and finishes initialization
    function getName( id, name ) {
        user = name; // Save user's name
        playTrue();
    }

    // Use the loaded image data to initialize house layout sprite and move it to the correct grid plane and location
    function spriteLayoutLoader( data ) {
        sprite_layout_id = PS.spriteImage( data ); // Save sprite id
        PS.spritePlane( sprite_layout_id, PLANE_SPRITE_LAYOUT ); // Draw on sprite plane
        PS.spriteMove( sprite_layout_id, 0, 0 ); // Place sprite in top left corner
        PS.spriteShow( sprite_layout_id, false ); // Don't show sprite at start
    }

    // Initialize Gregor sprite and move it to the correct grid plane
    function spriteGregorCreate() {
        sprite_gregor_id = PS.spriteSolid( 3, 3 ); // Save sprite id
        PS.spriteSolidColor( sprite_gregor_id, COLOR_GREGOR ); // Give sprite color of Gregor
        PS.spritePlane( sprite_gregor_id, PLANE_SPRITE_MOVEMENT ); // Draw on sprite plane
    }

    // Saves fast music channel id
    function loadMusicFastAll( data ) {
        id_music_fast_all = data.channel; // Save id
    }

    // Saves house fast music channel id
    function loadMusicFastHouse( data ) {
        id_music_fast_house = data.channel; // Save id
    }

    // Saves slow music channel id
    function loadMusicSlowAll( data ) {
        id_music_slow_all = data.channel; // Save id
    }

    // Saves house slow music channel id
    function loadMusicSlowHouse( data ) {
        id_music_slow_house = data.channel; // Save id
    }

    // Starts playing both fast music channels, starting volume of house layer is 0
    function startFastMusic() {

        PS.audioPlayChannel( id_music_fast_all, { volume : 0, loop : true } );
        PS.audioFade( id_music_fast_all, PS.CURRENT, VOLUME_MUSIC_FAST, TRANSITION_MUSIC_FADE_RATE ); // Fade in music

        PS.audioPlayChannel( id_music_fast_house, { volume : 0, loop : true } );
    }

    // Starts playing both slow music channels, starting volume of house layer is 0
    function startSlowMusic() {

        PS.audioPlayChannel( id_music_slow_all, { volume : 0, loop : true } );
        PS.audioFade( id_music_slow_all, PS.CURRENT, VOLUME_MUSIC_SLOW, START_MUSIC_FADE_RATE ); // Fade in music

        PS.audioPlayChannel( id_music_slow_house, { volume : 0, loop : true } );
    }

    // Stops playing slow music
    function stopSlowMusic() {
        PS.audioFade( id_music_slow_all, PS.CURRENT, 0, TRANSITION_MUSIC_FADE_RATE, stopChannel );
        PS.audioFade( id_music_slow_house, PS.CURRENT, 0, TRANSITION_MUSIC_FADE_RATE, stopChannel );
    }

    // Stops the specified audio channel
    function stopChannel( channel ) {
        PS.audioStop( channel );
    }


    // Sets up house or hall layout depending on which is specified (area)
    function setUp( area ) {
        var data, x, y, num;

        // Initialize level from data
        data = level_data[ level ];

        // Color each bead according to map array
        for ( y = 0; y < GRID_HEIGHT; y += 1 ) {
            for ( x = 0; x < GRID_WIDTH; x += 1 ) {

                num = PATH_MAP.data[ ( y * GRID_WIDTH ) + x ]; // Get array number from position

                // If area is "hall", color all house elements as black and place NPCs
                if ( area === HALL ) {

                    // If y is less than gate y value, color as black regardless of num and set data to obstacle
                    if ( y < GATE_Y ) {

                        PS.color( x, y, COLOR_OBSTACLE ); // Color as obstacle

                        // If not already a coin, save data as obstacle
                        if ( PS.data( x, y ) !== COIN_ID ) {
                            PS.data( x, y, OBSTACLE_ID ); // Save data as obstacle id
                        }

                        // If bead is a coin, color bead background to be black while in hall
                        if ( PS.data( x, y ) === COIN_ID ) {
                            PS.bgColor( x, y, COLOR_OBSTACLE ); // Set bead background color to obstacle color
                        }

                    } else if ( y >= GATE_Y ) {

                        // Color accordingly depending on if floor or obstacle
                        if ( ( num === VALUE_FLOOR ) || ( num === VALUE_GREGOR_NO_MOVE ) ) {

                            PS.data( x, y, FLOOR_ID ); // Save data as floor id

                            // If y value is GATE_Y, color as gate, otherwise floor
                            if ( y === GATE_Y ) {
                                PS.color( x, y, COLOR_GATE ); // Color as gate
                            } else {
                                PS.color( x, y, COLOR_FLOOR ); // Color as floor
                            }

                        } else if ( num === VALUE_OBSTACLE ) {

                            PS.color( x, y, COLOR_OBSTACLE ); // Color as obstacle
                            PS.data( x, y, OBSTACLE_ID ); // Save data as obstacle id

                        }
                    }

                }

                // If area is "house", color all hall elements as black and place Gregor/coins
                if ( area === HOUSE ) {

                    // If y is greater than gate y value and is NOT a coin UI element, color as black regardless of num
                    if ( ( y > GATE_Y ) && ( num !== VALUE_COIN_UI ) ) {

                        PS.color( x, y, COLOR_OBSTACLE ); // Color as obstacle
                        PS.data( x, y, OBSTACLE_ID ); // Save data as obstacle id

                    } else if ( y <= GATE_Y ) {

                        // Color accordingly depending on if floor (or floor where Gregor can't move) or obstacle
                        if ( ( ( num === VALUE_FLOOR ) || ( num === VALUE_GREGOR_NO_MOVE ) ) && ( PS.data( x, y ) !== COIN_ID ) ) {

                            PS.data( x, y, FLOOR_ID ); // Save data as floor id

                            // If y value is GATE_Y, color as gate, otherwise floor
                            if ( y === GATE_Y ) {
                                PS.color( x, y, COLOR_GATE ); // Color as gate
                            } else {
                                PS.color( x, y, COLOR_FLOOR ); // Color as floor
                            }

                        } else if ( num === VALUE_OBSTACLE ) {

                            PS.color( x, y, COLOR_OBSTACLE ); // Color as obstacle
                            PS.data( x, y, OBSTACLE_ID ); // Save data as obstacle id

                        }
                    }

                    // If bead has coin data, place coins
                    if ( PS.data( x, y ) === COIN_ID ) {
                        PS.color( x, y, COLOR_COIN ); // Set color to coin color
                        PS.bgAlpha( x, y, PS.ALPHA_TRANSPARENT ); // Make bead background color opaque
                        PS.radius( x, y, RADIUS_COIN ); // Set radius to coin radius (circle)
                    }

                }
            }
        }

        if ( area === HALL ) {

            // Make sure layout sprite is loaded before attempting to hide (so it doesn't try to hide it during startup)
            if ( sprite_layout_id !== undefined ) {
                PS.spriteShow( sprite_layout_id, false ); // Don't show sprite in hall
            }

            // Don't show Gregor sprite in hall
            PS.spriteShow( sprite_gregor_id, false );

            // Change grid color to obstacle
            PS.gridColor( COLOR_OBSTACLE );

            // Change status text color
            PS.statusColor( COLOR_STATUS_HALL );

            // Change grid shadow color
            PS.gridShadow( true, COLOR_SHADOW_HALL );

            // Place NPCs and player
            PS.color( data.mom_x, data.mom_y, COLOR_MOM ); // Place mom NPC
            PS.data( data.mom_x, data.mom_y, MOM_ID ); // Save data as mom NPC id
            PS.color( data.dad_x, data.dad_y, COLOR_DAD ); // Place dad NPC
            PS.data( data.dad_x, data.dad_y, DAD_ID ); // Save data as dad NPC id
            PS.spriteMove( sprite_player_id, player_x, player_y ); // Place player
            PS.data( player_x, player_y, FLOOR_ID ); // Save data as floor id (so can walk back to player start)

            // Reset Gregor location to starting location and hide sprite
            gregor_x = data.gregor_x; // Reset to starting x location
            gregor_y = data.gregor_y; // Reset to starting y location

            // Fade out fast music house layer if level is greater than or equal to LEVEL_MUSIC_FAST_START
            if ( level >= LEVEL_MUSIC_FAST_START ) {
                // Fade out house music layer
                PS.audioFade( id_music_fast_house, PS.CURRENT, 0, HOUSE_MUSIC_FADE_RATE );
            }

            // Fade out slow music house layer if level is greater than or equal to LEVEL_MUSIC_SLOW_START but less than LEVEL_MUSIC_FAST_START
            if ( ( level >= LEVEL_MUSIC_SLOW_START ) && ( level < LEVEL_MUSIC_FAST_START ) ) {
                // Fade out house music layer
                PS.audioFade( id_music_slow_house, PS.CURRENT, 0, HOUSE_MUSIC_FADE_RATE );
            }

            // Update player location to hall
            player_location = HALL;
        }

        if ( area === HOUSE ) {

            PS.spriteShow( sprite_layout_id, true ); // Show layout sprite in house

            // Change grid color to floor
            PS.gridColor( COLOR_FLOOR );

            // Change status text color
            PS.statusColor( COLOR_STATUS_HOUSE );

            // Change grid shadow color
            PS.gridShadow( true, COLOR_SHADOW_HOUSE );

            // Update Gregor sprite coordinates and show Gregor sprite
            gregor_sprite_x = gregor_x - 1;
            gregor_sprite_y = gregor_y - 1;
            PS.spriteShow( sprite_gregor_id, true );
            PS.spriteMove( sprite_gregor_id, gregor_sprite_x, gregor_sprite_y );
            PS.statusText( gregor_status );
            PS.spriteMove( sprite_player_id, player_x, player_y );

            // Play Gregor line for current level
            PS.audioPlay( gregor_line, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

            if ( level >= LEVEL_MUSIC_FAST_START ) {
                // Fade in house music layer
                PS.audioFade( id_music_fast_house, PS.CURRENT, VOLUME_MUSIC_FAST, HOUSE_MUSIC_FADE_RATE );
            }

            if ( ( level >= LEVEL_MUSIC_SLOW_START ) && ( level < LEVEL_MUSIC_FAST_START) ) {
                // Fade in house music layer
                PS.audioFade( id_music_slow_house, PS.CURRENT, VOLUME_MUSIC_SLOW, HOUSE_MUSIC_FADE_RATE );
            }

            // Update player location to house
            player_location = HOUSE;

            // Reset steps player has taken to 0 (for Gregor movement calculations)
            player_steps = 0;
        }

    }

    // Sets up UI elements
    function setUpUI() {
        var len, i, pos, x, y;

        // Set up coin inventory UI element
        len = coin_inventory.length;
        for ( i = 0; i < len; i += 1 ) {
            pos = coin_inventory[ i ];
            x = pos[ 0 ];
            y = pos[ 1 ];
            PS.color( x, y, COLOR_COIN_EMPTY ); // Set color to empty coin color
            PS.bgColor( x, y, COLOR_OBSTACLE ); // Set bead background color to match obstacle
            PS.bgAlpha( x, y, PS.ALPHA_OPAQUE ); // Make bead background color opaque
            PS.radius( x, y, RADIUS_COIN ); // Set radius to coin radius (circle)
        }

        // Set up dropped off coin count UI element
        PS.color( COIN_COUNTER_X, COIN_COUNTER_Y, COLOR_COIN ); // Draw coin symbol for counter
        PS.bgColor( COIN_COUNTER_X, COIN_COUNTER_Y, COLOR_OBSTACLE ); // Set bead background color to match obstacle
        PS.bgAlpha( COIN_COUNTER_X, COIN_COUNTER_Y, PS.ALPHA_OPAQUE ); // Make bead background color opaque
        PS.radius( COIN_COUNTER_X, COIN_COUNTER_Y, RADIUS_COIN ); // Set radius to coin radius (circle)
        PS.glyphColor( PS.ALL, PS.ALL, COLOR_GLYPH ); // Make all glyphs white
        PS.color( X_GLYPH_X, GLYPH_Y, COLOR_OBSTACLE ); // Color "X" glyph bead black
        PS.glyph( X_GLYPH_X, GLYPH_Y, X_GLYPH ); // Draw "X" glyph
        PS.color( NUM_GLYPH_ONES_X, GLYPH_Y, COLOR_OBSTACLE ); // Color ones' place glyph bead black
        PS.glyph( NUM_GLYPH_ONES_X, GLYPH_Y, num_glyph_ones ); // Draw ones' place glyph for number counter
        PS.color( NUM_GLYPH_TENS_X, GLYPH_Y, COLOR_OBSTACLE ); // Color tens' place glyph bead black
        PS.glyph( NUM_GLYPH_TENS_X, GLYPH_Y, num_glyph_tens ); // Draw tens' place glyph for number counter
    }

    // Saves coin ids at the specified coordinates in the given array and saves number of coins needed to beat level
    function saveCoins( coin_list ) {
        var i, pos, x, y;

        // Set up coins from coin_list
        total_coin_win = coin_list.length;
        for ( i = 0; i < total_coin_win; i += 1 ) {
            pos = coin_list[ i ];
            x = pos[ 0 ];
            y = pos[ 1 ];
            PS.data( x, y, COIN_ID ); // Save data as coin id
        }
    }

    // Place new coin in inventory or display error message if inventory is full
    function fillInventory() {
        var len, i, pos, x, y;

        // Check color of coin inventory slots and color in next available one
        len = coin_inventory.length;
        for ( i = 0; i < len; i += 1 ) {
            pos = coin_inventory[ i ];
            x = pos[ 0 ];
            y = pos[ 1 ];

            // If space is empty, fill in and return, otherwise keep going through loop
            if ( ( PS.color( x, y ) === COLOR_COIN_EMPTY ) ) {
                PS.color( x, y, COLOR_COIN ); // Set inventory slot to coin color
                PS.audioPlay( SFX_COIN_PICKUP, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } ); // Play coin pickup sound
                inventory_count += 1; // Add 1 to inventory_count

                // Display correct inventory count status line
                if ( inventory_count === 1 ) {
                    PS.statusText( STATUS_INVENTORY_1 );
                } else if ( inventory_count === 2 ) {
                    PS.statusText( STATUS_INVENTORY_2 );
                } else if ( inventory_count === 3 ) {
                    PS.statusText( STATUS_INVENTORY_3 );
                } else if ( inventory_count === 4 ) {
                    PS.statusText( STATUS_INVENTORY_4 );
                }

                return;
            }
        }
    }

    // Empties inventory and sets inventory_count back to 0
    function emptyInventory() {
        var len, i, pos, x, y;

        // Resets color of all coin inventory slots
        len = coin_inventory.length;
        for ( i = 0; i < len; i += 1 ) {
            pos = coin_inventory[ i ];
            x = pos[ 0 ];
            y = pos[ 1 ];
            PS.color( x, y, COLOR_COIN_EMPTY );
        }

        // Set inventory_count to 0
        inventory_count = 0;
    }

    // Empties inventory, increases coin_counter, and progresses to next level if all coins have been gathered
    function dropOffCoins() {
        var coin_string;

        // Report how many coins the player dropped off
        if ( PS.dbValid( DATABASE ) ) {
            PS.dbEvent( DATABASE, "level", level, "coins?", inventory_count );
        }

        // If at least one coin was dropped off, play sound effect
        if ( inventory_count >= 1 ) {
            PS.audioPlay( SFX_COIN_DROPOFF, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );
        }

        // Change status line to report how many coins were dropped off
        if ( inventory_count === 0 ) {
            PS.statusText( "You returned with nothing." );
        } else if ( inventory_count === 1 ) {
            PS.statusText( "You returned with 1 coin." );
        } else {
            PS.statusText( "You returned with " + inventory_count + " coins." );
        }

        // Add number of coins in inventory to coin counter
        coin_counter += inventory_count;

        // Add number of coins in inventory to total coins
        total_coins += inventory_count;

        // Empty inventory
        emptyInventory();

        // Convert coin_counter number to string
        coin_string = total_coins.toString();

        // Get tens' and ones' place digits based on coin_string and update glyphs
        if ( coin_string.length === 1 ) {
            num_glyph_ones = coin_string;
            PS.glyph( NUM_GLYPH_ONES_X, GLYPH_Y, num_glyph_ones );
        } else if ( coin_string.length === 2 ) {
            num_glyph_tens = coin_string.charAt( 0 ); // Tens' place is first character in string
            PS.glyph( NUM_GLYPH_TENS_X, GLYPH_Y, num_glyph_tens );
            num_glyph_ones = coin_string.charAt( 1 ); // Ones' place is second character in string
            PS.glyph( NUM_GLYPH_ONES_X, GLYPH_Y, num_glyph_ones );
        }

        // If all coins have been collected, go to next level
        if ( coin_counter === total_coin_win ) {

            coin_counter = 0; // Reset coin_counter

            // If last level, go to ending
            if ( ( level + 1 ) === level_data.length ) {
                play = false;
                endGame();
            } else {
                level += 1; // Add one to level
                PS.audioPlay( SFX_STINGER, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } ); // Play level victory sound
                level_first_load = true; // Set level_first_load to true
                startLevel( level ); // Start next level
            }
        }

    }

    // Resets coin counter (subtracts coin_counter from total_coins) and update glyphs accordingly
    function resetCounter() {
        var coin_string;

        // Subtract coin_counter (current coins collected during current level) from total coins
        total_coins -= coin_counter;

        // Convert coin_counter number to string
        coin_string = total_coins.toString();

        // Get tens' and ones' place digits based on coin_string and update glyphs
        if ( coin_string.length === 1 ) {
            num_glyph_tens = "0"; // No tens place so it's "0" (in case player drops below "10" with reset)
            PS.glyph( NUM_GLYPH_TENS_X, GLYPH_Y, num_glyph_tens );
            num_glyph_ones = coin_string;
            PS.glyph( NUM_GLYPH_ONES_X, GLYPH_Y, num_glyph_ones );
        } else if ( coin_string.length === 2 ) {
            num_glyph_tens = coin_string.charAt( 0 ); // Tens' place is first character in string
            PS.glyph( NUM_GLYPH_TENS_X, GLYPH_Y, num_glyph_tens );
            num_glyph_ones = coin_string.charAt( 1 ); // Ones' place is second character in string
            PS.glyph( NUM_GLYPH_ONES_X, GLYPH_Y, num_glyph_ones );
        }

        // Reset coin_counter to 0
        coin_counter = 0;

    }

    // Start the specified level
    function startLevel( level ) {
        var data;

        // Initialize level from data
        data = level_data[ level ];

        // Save player start location
        player_x = data.player_x;
        player_y = data.player_y;

        // Save Gregor start location and movement rate for this level
        gregor_x = data.gregor_x;
        gregor_y = data.gregor_y;
        gregor_move_rate = data.gregor_move_rate;

        // Save status line and dialogue variables for level
        mom_status_primary = data.mom_status_primary;
        mom_status_secondary_1 = data.mom_status_secondary_1;
        mom_status_secondary_2 = data.mom_status_secondary_2;
        dad_status_primary = data.dad_status_primary;
        dad_status_secondary_1 = data.dad_status_secondary_1;
        dad_status_secondary_2 = data.dad_status_secondary_2;
        gregor_status = data.gregor_status;
        gregor_line = data.gregor_line;

        // Display level starting text if first load of specific level and set level_first_load/seen parent status text variables to false
        // Start correct music if applicable
        if ( level_first_load ) {

            PS.statusText( data.start_status );
            level_first_load = false;
            seen_mom_status = false;
            seen_dad_status = false;
            next_status_mom = mom_status_primary;
            next_status_dad = dad_status_primary;

            // If correct level to start fast music, start music and stop slow music
            if ( level === LEVEL_MUSIC_FAST_START ) {
                startFastMusic();
                stopSlowMusic();
            }

            // If correct level to start slow music, start music
            if ( level === LEVEL_MUSIC_SLOW_START ) {
                startSlowMusic();
            }

        }

        // Set up hall
        setUp( HALL );

        // Place coins (not visible until move to house)
        saveCoins( data.coins );

    }

    // Resets level if player hit Gregor
    function resetLevel() {

        // Turn on fades for all beads, set play to true when done
        PS.fade( PS.ALL, PS.ALL, FADE_RATE, { onEnd : playTrue } );

        // Set play to false
        play = false;

        // Display fail status text
        PS.statusText( STATUS_FAIL );

        // Play fail sound
        PS.audioPlay( SFX_CAUGHT, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

        // Empty inventory
        emptyInventory();

        // Reset coin counter
        resetCounter();

        // Restart level
        startLevel( level );
    }

    // Ends the game and sends database if data collection is turned on
    function endGame() {

        // Stop Gregor movement timer of last level
        PS.timerStop( gregor_timer );

        // Fade out fast music
        PS.audioFade( id_music_fast_all, PS.CURRENT, 0, END_MUSIC_FADE_RATE, stopChannel );
        PS.audioFade( id_music_fast_house, PS.CURRENT, 0, END_MUSIC_FADE_RATE, stopChannel );

        // Start end_timer for ending sequence
        end_timer = PS.timerStart( 1, endTick );

        // Turn on fades for glyphs
        PS.glyphFade( PS.ALL, PS.ALL, FADE_RATE );

        // Set endgame to true
        endgame = true;

        if ( PS.dbValid( DATABASE ) ) {

            // Record that player made it to the end
            PS.dbEvent( DATABASE, "endgame", endgame );

            // Send to email and erase database
            PS.dbSend( DATABASE, EMAIL, { discard : true } );

        }

    }

    // Called every frame since end started, used to animate Gregor's death and fade out screen
    function endTick() {

        // Add one to end_frames
        end_frames += 1;

        // Make sure player cannot move
        play = false;

        // Change line and Gregor transparency after 1 second (and do the same every 4 seconds after)
        if ( end_frames === 60 ) {

            // Start playing ending stinger
            PS.audioPlay( MUSIC_ENDING, { path : SOUND_PATH, lock : true, volume : VOLUME_MUSIC_ENDING } );

            // Change status line
            PS.statusText( STATUS_ENDING_1 );

            // Play corresponding Gregor line
            PS.audioPlay( LINE_GREGOR_END1, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

            // Make Gregor sprite more transparent
            PS.spriteSolidAlpha( sprite_gregor_id, ( 255 / ENDING_STATUS_TOTAL ) * ( ENDING_STATUS_TOTAL - 1 ) );
        }

        if ( end_frames === 300 ) {

            // Change status line
            PS.statusText( STATUS_ENDING_2 );

            // Play corresponding Gregor line
            PS.audioPlay( LINE_GREGOR_END2, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

            // Make Gregor sprite more transparent
            PS.spriteSolidAlpha( sprite_gregor_id, ( 255 / ENDING_STATUS_TOTAL ) * ( ENDING_STATUS_TOTAL - 2 ) );

        }

        if ( end_frames === 540 ) {

            // Change status line
            PS.statusText( STATUS_ENDING_3 );

            // Play corresponding Gregor line
            PS.audioPlay( LINE_GREGOR_END3, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

            // Make Gregor sprite more transparent
            PS.spriteSolidAlpha( sprite_gregor_id, ( 255 / ENDING_STATUS_TOTAL ) * ( ENDING_STATUS_TOTAL - 3 ) );

        }

        if ( end_frames === 780 ) {

            // Change status line
            PS.statusText( STATUS_ENDING_4 );

            // Play corresponding Gregor line
            PS.audioPlay( LINE_GREGOR_END4, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

            // Make Gregor sprite more transparent
            PS.spriteSolidAlpha( sprite_gregor_id, ( 255 / ENDING_STATUS_TOTAL ) * ( ENDING_STATUS_TOTAL - 4 ) );

        }

        // Fade screen to black
        if ( end_frames === 900 ) {

            // Delete all sprites
            PS.spriteDelete( sprite_player_id );
            PS.spriteDelete( sprite_layout_id );
            PS.spriteDelete( sprite_gregor_id );

            // Fade everything to black
            PS.color( PS.ALL, PS.ALL, COLOR_OBSTACLE );
            PS.glyphColor( PS.ALL, PS.ALL, COLOR_OBSTACLE );
            PS.gridColor( COLOR_OBSTACLE );
            PS.gridShadow( false );

        }
    }

    // Used to move Gregor during the last level
    function moveGregorTimer() {

        // If current area is house, move Gregor
        if ( player_location === HOUSE ) {
            moveGregor();
        }

    }

    // Moves Gregor toward player based on pathfinding for PATH_MAP
    function moveGregor() {
        var steps, path, nx, ny;

        if ( play ) {

            // Turn off all fades
            PS.fade( PS.ALL, PS.ALL, 0 );

            // Get array for path
            steps = PS.pathFind( path_id, gregor_x, gregor_y, player_x, player_y, { no_diagonals : true } );

            // Get next position
            path = steps[ 0 ];
            nx = path[ 0 ]; // Next x position
            ny = path[ 1 ]; // Next y position

            // If next position value is floor where Gregor cannot move (because of 3x3 sprite size), return
            if ( PATH_MAP.data[ ( ny * GRID_WIDTH ) + nx ] === VALUE_GREGOR_NO_MOVE ) {
                return;
            }

            // Save new Gregor location
            gregor_x = nx;
            gregor_y = ny;

            // Update Gregor sprite coordinates
            gregor_sprite_x = gregor_x - 1;
            gregor_sprite_y = gregor_y - 1;

            // Move Gregor to new position and update data
            PS.spriteMove( sprite_gregor_id, gregor_sprite_x, gregor_sprite_y );

            // Play next Gregor skitter sound in sequence and update for next movement
            if ( gregor_skitter_count === 1 ) {
                PS.audioPlay( SFX_GREGOR_SKITTER_1, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );
                gregor_skitter_count = 2;
            } else if ( gregor_skitter_count === 2 ) {
                PS.audioPlay( SFX_GREGOR_SKITTER_2, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );
                gregor_skitter_count = 3;
            } else if ( gregor_skitter_count === 3 ) {
                PS.audioPlay( SFX_GREGOR_SKITTER_3, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );
                gregor_skitter_count = 4;
            } else if ( gregor_skitter_count === 4 ) {
                PS.audioPlay( SFX_GREGOR_SKITTER_4, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );
                gregor_skitter_count = 5;
            } else if ( gregor_skitter_count === 5 ) {
                PS.audioPlay( SFX_GREGOR_SKITTER_5, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );
                gregor_skitter_count = 6;
            } else if ( gregor_skitter_count === 6 ) {
                PS.audioPlay( SFX_GREGOR_SKITTER_6, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );
                gregor_skitter_count = 1;
            }

        }
    }

    // Called when player and Gregor sprites collide
    function gregorCollide( s1, p1, s2, p2, type ) {

        // If sprites are overlapping and on same plane (PLANE_SPRITE_MOVEMENT), reset level
        if ( ( type === PS.SPRITE_OVERLAP ) && ( p1 === p2 )) {
            resetLevel();
        }

    }

    // Sets play to true and starts timer for Gregor movement if last level
    function playTrue() {
        play = true;

        if ( gregor_timer === null ) {

            // If last level, start timer for Gregor movement
            if ( ( level + 1 ) === level_data.length ) {
                gregor_timer = PS.timerStart( MOVE_RATE, moveGregorTimer );
            }

        }
    }

    // Functions accessible outside of G function
    var exports = {

        // G.init()
        // Initializes the game
        init : function() {

            initStart();

            play = false;

            // Initialize database if COLLECT_DATA is true, otherwise start without database
            if ( COLLECT_DATA ) {
                PS.dbInit( DATABASE, {
                    login : getName
                } );
            } else if ( !COLLECT_DATA ) {
                playTrue();
            }

        },

        // G.move( h, v )
        // Move player bead
        move : function( h, v ) {
            var nx, ny, data;

            // Can only move if play is true
            if ( play ) {

                // Turn off all fades
                PS.fade( PS.ALL, PS.ALL, 0 );

                // Calculate proposed new location
                nx = player_x + h;
                ny = player_y + v;

                data = PS.data( nx, ny );

                // If bead there is an obstacle, exit without moving and play error sound
                if ( data === OBSTACLE_ID ) {
                    PS.audioPlay( SFX_OBSTACLE_ERROR, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );
                }

                // If bead is mom NPC, display correct mom status line, play mom sound, and set seen_mom_status to true
                if ( data === MOM_ID ) {

                    PS.statusText( next_status_mom );

                    // Cycle through mom status lines
                    if ( next_status_mom === mom_status_primary ) {
                        next_status_mom = mom_status_secondary_1;
                    } else if ( next_status_mom === mom_status_secondary_1 ) {
                        next_status_mom = mom_status_secondary_2;
                    } else if ( next_status_mom === mom_status_secondary_2 ) {
                        next_status_mom = mom_status_primary;
                    }

                    PS.audioPlay( LINE_MOM, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

                    seen_mom_status = true;

                }

                // If bead is dad NPC, display correct dad status line, play dad sound, and set seen_dad_status to true
                if ( data === DAD_ID ) {

                    PS.statusText( next_status_dad );

                    // Cycle through dad status lines
                    if ( next_status_dad === dad_status_primary ) {
                        next_status_dad = dad_status_secondary_1;
                    } else if ( next_status_dad === dad_status_secondary_1 ) {
                        next_status_dad = dad_status_secondary_2;
                    } else if ( next_status_dad === dad_status_secondary_2 ) {
                        next_status_dad = dad_status_primary;
                    }

                    PS.audioPlay( LINE_DAD, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

                    seen_dad_status = true;
                }

                // If bead is coin, move there if inventory is not full
                if ( data === COIN_ID ) {

                    // If number of coins in inventory is less than inventory max, pick up and move to space
                    // Otherwise, display error message and play error sound
                    if ( inventory_count < INVENTORY_MAX ) {

                        // Add one to inventory
                        fillInventory();

                        // Change old location to floor color, reset radius, and change id of bead to floor
                        PS.color( player_x, player_y, COLOR_FLOOR );
                        PS.radius( player_x, player_y, 0 );
                        PS.data( player_x, player_y, FLOOR_ID );

                        // Update player location
                        player_x = nx;
                        player_y = ny;

                        // Updated to player radius (so player doesn't appear as circle)
                        PS.radius( player_x, player_y, RADIUS_PLAYER );

                        // Move player sprite to new location
                        PS.spriteMove( sprite_player_id, nx, ny );

                        // If not last level, add one to player steps and move Gregor

                        if ( !( ( level + 1 ) === level_data.length ) ) {

                            // Add one to player steps
                            player_steps += 1;

                            // Move Gregor based on current movement rate
                            if ( ( player_steps % gregor_move_rate ) === 0 ) {
                                moveGregor();
                            }

                        }

                    } else {

                        PS.audioPlay( SFX_COIN_ERROR, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );; // Play inventory full error sound
                        PS.statusText( STATUS_INVENTORY_FULL ); // Display inventory full error status text

                    }
                }

                // If bead is floor, move there
                if ( data === FLOOR_ID ) {

                    // Change old location to floor or gate color
                    if ( player_y === GATE_Y ) {
                        PS.color( player_x, player_y, COLOR_GATE );
                    } else {
                        PS.color( player_x, player_y, COLOR_FLOOR );
                    }

                    // Reset current lcoation bead data back to floor id
                    PS.data( player_x, player_y, FLOOR_ID );

                    // Reset radius in case coin was just picked up
                    PS.radius( player_x, player_y, 0 );

                    // Update player location
                    player_x = nx;
                    player_y = ny;

                    // Move player sprite to new location
                    PS.spriteMove( sprite_player_id, player_x, player_y );

                    // If player is in the house and not last level, add one to player steps and move Gregor based on movement rate
                    if ( ( player_location === HOUSE ) && !( ( level + 1 ) === level_data.length ) ) {

                        // Add one to player steps
                        player_steps += 1;

                        // Move Gregor based on current movement rate
                        if ( ( player_steps % gregor_move_rate ) === 0 ) {
                            moveGregor();
                        }

                    }

                    // If y value of new location is part of the "gate", fade in/out hall or house depending on v
                    // Don't fade to house if players has not seen both mom and dad status liens for level yet
                    if ( ( player_y === GATE_Y ) && ( v !== 0 ) ) {

                        // Make sure player has seen both parents' status lines first
                        if ( seen_mom_status && seen_dad_status ) {

                            // Turn on fades for all beads and grid, set play to true when grid done
                            PS.fade( PS.ALL, PS.ALL, FADE_RATE );
                            PS.gridFade( FADE_RATE, { onEnd : playTrue } );

                            // Set play to false
                            play = false;

                            // If v was -1, fade out hall/fade in house (player moved up from hall)
                            if ( v === -1 ) {
                                setUp( HOUSE );
                            }

                            // If v was 1, drop off coins and fade out house/fade in hall (player moved down from house)
                            if ( v === 1 ) {

                                dropOffCoins();

                                // If not ending, set up hall after
                                if ( !endgame ) {
                                    setUp( HALL );
                                }

                            }

                        } else if ( !seen_mom_status || !seen_dad_status ) {
                            PS.statusText( STATUS_CHECK_PARENTS ); // Display check with parents text prompt
                        }


                    }
                }
            }
        },

        // G.shutdown()
        // If database is valid, send to email and erase when shutdown is called
        shutdown: function () {

            // If database is valid, report endgame as false and send database
            if ( PS.dbValid( DATABASE ) ) {
                PS.dbEvent( DATABASE, "endgame", endgame );
                PS.dbSend( DATABASE, EMAIL, { discard : true } );
            }

        }

    };

    return exports;

} () );

PS.init = function( system, options ) {
	"use strict";

	G.init();
};

PS.touch = function( x, y, data, options ) {
	"use strict";

	// Get coordinates for coin placement design
	// PS.debug( "( " + x + ", " + y + " )" );
};

PS.release = function( x, y, data, options ) {
	"use strict";
};

PS.enter = function( x, y, data, options ) {
	"use strict";
};

PS.exit = function( x, y, data, options ) {
	"use strict";
};

PS.exitGrid = function( options ) {
	"use strict";
};

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";

    switch ( key ) {
        case PS.KEY_ARROW_UP:
        case 119:
        case 87: {
            G.move(0, -1); // Move UP ( v = -1 )
            break;
        }

        case PS.KEY_ARROW_DOWN:
        case 115:
        case 83: {
            G.move(0, 1); // Move DOWN ( v = 1 )
            break;
        }

        case PS.KEY_ARROW_LEFT:
        case 97:
        case 65: {
            G.move(-1, 0); // Move LEFT ( h = -1 )
            break;
        }

        case PS.KEY_ARROW_RIGHT:
        case 100:
        case 68: {
            G.move(1, 0); // Move RIGHT ( h = 1 )
            break;
        }
    }
};

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";
};

PS.input = function( sensors, options ) {
	"use strict";
};

PS.shutdown = function( options ) {
	"use strict";

	G.shutdown();
};
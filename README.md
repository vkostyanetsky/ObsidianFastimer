# Fastimer ⌛ ⏲️ ⌚

It is a plugin for [Obsidian](https://obsidian.md) designed to help you monitor your [fasting intervals](https://en.wikipedia.org/wiki/Intermittent_fasting).  

## 🙂 How to use it?

The idea is simple: when you start a new fast, you add a `fastimer` block in a note where you set a date and time when you have started.

For instance:

```fastimer
2024-02-06 18:50
```

The plugin takes it and shows elapsed time, remaining time, and something like a progress bar to visualize your spilled blood, sweat, and tears :)

Here is an example:

```
ACTIVE FAST

From: 2024-02-06, 18:50
Goal: 2024-02-07, 10:50

Fasting zones:

1. Anabolic     2024-02-06, 18:50 ← you are here
2. Catabolic    2024-02-06, 22:50
3. Fat burning  2024-02-07, 10:50
4. Ketosis      2024-02-07, 18:50
5. Deep ketosis 2024-02-09, 18:50

####----------------------------------- 10%

Elapsed time: 1h 36m
Remaining:    14h 23m
```

Everything above updates when a block is being rendered. To trigger this, you can edit the block or reopen the note.

To mark an active fast as finished, you can add the date and time of the moment to the same block. 

```fastimer
2024-02-06 18:50
2024-02-07 15:00
```

## 🤔 Questions

### How do I set a fasting interval's length?

It is assumed that the length of a regular fast is 16 hours. You can change the default value in the plugin's settings or set it directly for one specific fast. 

Below, we are going to fast for 18 hours:

```fastimer
18
2024-02-06 18:50
```
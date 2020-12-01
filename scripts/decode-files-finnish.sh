#! /usr/bin/env bash

DESCRIPTION_FOLDER=original_descriptions
AUDIO_FOLDER=original_audio

for _ in 1 2 3
do
    mmv "$AUDIO_FOLDER/*C3B6*" "$AUDIO_FOLDER/#1ö#2"
    mmv "$AUDIO_FOLDER/*C3A4*" "$AUDIO_FOLDER/#1ä#2"
    mmv "$DESCRIPTION_FOLDER/*C3B6*" "$DESCRIPTION_FOLDER/#1ö#2"
    mmv "$DESCRIPTION_FOLDER/*C3A4*" "$DESCRIPTION_FOLDER/#1ä#2"
done

for REP in "txtSelitys=/" "%2C/," "%20/ " "%C3%A4/ä" "%C3%B6/ö" "%C4/Ä" "%D6/Ö"
do
    sed -i "s/$REP/g" $DESCRIPTION_FOLDER/*
done
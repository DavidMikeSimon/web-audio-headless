# Based on https://gist.github.com/coderofsalvation/7740333

loopcrossfade(){
  input="$1"; outputdir="$2"; tmpinput="/tmp/$(basename "$input").loopcrossfade.flac"

  faderatio=10.0

  [[ ! -f "$input" ]] && echo "cannot find $1" && exit 1
  outputfile="$outputdir/$(basename "$input" .webm).ogg"

  # prepare input
  format="-c 2 -e unsigned -b 16 -r 44100"
  ffmpeg -i "$input" -ss 5 -c:a flac "$tmpinput"
  samples="$(soxi "$tmpinput" | grep Duration | cut -d' ' -f11 )"
  fadetime="$( echo "$samples/$faderatio" | bc )"
  fadetimehalf="$( echo "$fadetime/2" | bc )"
  middle="$( echo "$samples-$fadetime" | bc )"

  # get middle part + add fadein 
  sox "$tmpinput" "$tmpinput.lmid.flac" fade t "$fadetimehalf"s trim 0 "$middle"s
  # get end (+fadeout)
  sox "$tmpinput" "$tmpinput.lend.flac" trim "$middle"s "$fadetime"s
  sox "$tmpinput.lend.flac" "$tmpinput.lendfadeout.flac" fade t 0 0 "$fadetime"s
  # combine together
  sox -m "$tmpinput.lendfadeout.flac" "$tmpinput.lmid.flac" "$outputfile" gain -n -2
  echo "written $outputfile"
  rm /tmp/*.loopcrossfade.*
}

loopcrossfade "$1" "$2"

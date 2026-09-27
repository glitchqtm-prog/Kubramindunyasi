/* dugun-tarihi.js — Astro Yuvam astrolojik düğün, nikah ve nişan tarihi hesaplayıcı (Ekim 2026 – Aralık 2028).
 * Günlük puanlar astronomy-engine ile hesaplanan gezegen konumlarından üretilip aşağıya gömülmüştür. */
(function () {
  "use strict";
  var D = {"t0":"2026-09-29","S":["0::0:0","0:vz.ai.ag:1:7","-1:vz.ai:2:7","0:vz.ai.cu:2:7","-4:vr.vz.ai.ag:3:7","-4:vr.vz.ai.ag:3:7","-5:vr.vz.ai:4:7","-5:vr.vz.ai:4:7","-5:vr.vz.ai:5:7","-5:vr.vz.ai:5:7","-4:vr.vz.ak.ag.cu:6:7","-5:vr.vz.ak.ag:6:7","-5:vr.vz.ak.ag:6:7","-5:vr.vz.ab.az:7:7","-5:vr.vz.ab.az:7:7","-4:vr.vz.ab:8:7","-4:vr.vz.ab:8:7","-3:vr.vz.ab.cu:8:7","-5:vr.vz.ab.az:9:7","-5:vr.vz.ab.az:9:7","-4:vr.vz.ab:10:7","-4:vr.vz.ab:10:7","-4:vr.vz.ab:10:7","-4:vr.vz.ab:11:7","-5:vr.mi.vz.ab.cu:11:7","-7:vr.mr.vz.ab:0:7","-5:vr.mr.vg.ad:0:6","-4:vr.mr.vg.ad.ag:1:6","-4:vr.mr.vg.ai.ag:1:6","-5:vr.mr.vg.ai:2:6","-5:vr.mr.vg.ai:2:6","-3:vr.mr.vg.ai.ag.cu:3:6","-4:vr.mr.vg.ai.ag:3:6","-5:vr.mr.vg.ai:4:6","-5:vr.mr.vg.ai:4:6","-5:vr.mr.vg.ai:5:6","-5:vr.mr.vg.ai:5:6","-5:vr.mr.vg.ai:5:6","-3:vr.mr.vg.ai.ag.cu:6:6","-4:vr.mr.vg.ai.ag:6:6","-7:vr.mr.vg.ak.az:7:6","-7:vr.mr.vg.ak.az:7:6","-6:vr.mr.vg.ak:8:6","-4:vr.mr.vg.ab:8:6","-4:vr.mr.vg.ab:8:6","-4:vr.mr.vg.ab.az.cu:9:6","0:mi.vg.ab.az:9:6","3:vg.ab:10:6","3:vg.ab:10:6","3:vg.ab:10:6","3:vg.ab:11:6","3:vg.ab:11:6","4:vg.ab.cu:0:6","3:vg.ab:0:6","4:vg.ab.ag:1:6","4:vg.ab.ag:1:6","2:vg.ad:2:6","2:vg.ad:2:6","3:vg.ai.ag:3:6","4:vg.ai.ag.cu:3:6","2:vg.ai:4:6","2:vg.ai:4:6","2:vg.ai:4:6","2:vg.ai:5:6","2:vg.ai:5:6","3:vg.ai.ag:6:6","1:vz.ai.ag.cu:6:7","-2:vz.ai.az:7:7","-2:vz.ai.az:7:7","-3:vz.ak.az:7:7","-2:vz.ak:8:7","-2:vz.ak:8:7","-3:vz.ak.az:9:7","0:vz.ab.az.cu:9:7","-1:vz.ab.az:9:7","0:vz.ab:10:7","0:vz.ab:10:7","0:vz.ab:11:7","0:vz.ab:11:7","0:vz.ab:11:7","1:vz.ab.cu:0:7","0:vz.ab:0:7","1:vz.ab.ag:1:7","1:vz.ab.ag:1:7","0:vz.ab:2:7","-1:vz.ad:2:7","0:vz.ad.ag:3:7","1:vz.ai.ag.cu:3:7","-1:vz.ai:4:7","-1:vz.ai:4:7","-1:vz.ai:5:7","-1:vz.ai:5:7","0:vz.ai.ag:6:7","0:vz.ai.ag:6:7","-1:vz.ai.az.cu:7:7","-2:vz.ai.az:7:7","-2:vz.ai.az:7:7","-1:vz.ai:8:7","-1:vz.ai:8:7","-3:vz.ak.az:9:7","-2:ak.az:9:8","-1:ak.az.cu:9:8","-1:ak:10:8","1:ab:10:8","0:ar.ab:11:8","0:ar.ab:11:8","0:ar.ab:11:8","0:ar.ab:0:8","1:ar.ab.cu:0:8","1:ar.ab.ag:1:8","1:ar.ab.ag:1:8","0:ar.ab:2:8","0:ar.ab:2:8","1:ar.ab.ag:3:8","0:ar.ad.ag:3:8","0:ar.ad.cu:4:8","-1:ar.ad:4:8","-1:ar.ai:5:8","-1:ar.ai:5:8","0:ar.ai.ag:6:8","0:ar.ai.ag:6:8","0:ar.ai.ag:6:8","-1:ar.ai.az.cu:7:8","-2:ar.ai.az:7:8","-1:ar.ai:8:8","-1:ar.ai:8:8","-1:ar.ai:8:8","-5:ty.ar.ai.az:9:8","-5:ty.ar.ai.az:9:9","-4:ty.ar.ak.cu:10:9","-6:tg.ar.ak:10:9","-5:ty.ar.ak:10:9","-5:ty.mi.ar.ab:11:9","-5:ty.mi.ar.ab:11:9","-4:ts.mr.ar.ab:0:9","-4:ts.mr.ar.ab:0:9","-2:ts.mr.ar.ab.ag.cu:1:9","-3:ts.mr.ar.ab.ag:1:9","-3:ts.mr.ar.ab.ag:1:9","-4:ts.mr.ar.ab:2:9","-4:ts.mr.ar.ab:2:9","-3:ts.mr.ar.ab.ag:3:9","-5:ty.mr.ar.ab.ag:3:9","-5:ty.mr.ar.ab.cu:4:9","-7:ty.mr.ar.ad:4:9","-8:tg.mr.ar.ad:5:9","-7:ty.mr.ar.ai:5:9","-6:ty.mr.ar.ai.ag:6:9","-6:ty.mr.ar.ai.ag:6:9","-5:mr.ar.ai.az:7:9","-4:mr.ar.ai.az.cu:7:9","-4:mr.ar.ai:8:9","-4:mr.ar.ai:8:9","-4:mr.ar.ai:8:10","-5:mr.ar.ai.az:9:10","-5:mr.ar.ai.az:9:10","-3:mi.ar.ai:10:10","0:ar.ai.cu:10:10","-1:ar.ai:10:10","-2:ar.ak:11:10","-2:ar.ak:11:10","-2:ar.ak:0:10","0:ar.ab:0:10","0:ar.ab:0:10","2:ar.ab.ag.cu:1:10","1:ar.ab.ag:1:10","0:ar.ab:2:10","0:ar.ab:2:10","1:ar.ab.ag:3:10","1:ar.ab.ag:3:10","0:ar.ab:4:10","1:ar.ab.cu:4:10","0:ar.ab:5:10","-1:ar.ad:5:10","0:ar.ad.ag:6:10","0:ar.ad.ag:6:10","0:ar.ai.ag:6:10","-2:ar.ai.az:7:10","1:ar.vg.ai.az.cu:7:11","1:ar.vg.ai:8:11","1:ar.vg.ai:8:11","0:ar.vg.ai.az:9:11","0:ar.vg.ai.az:9:11","0:ar.vg.ai.az:9:11","2:vg.ai:10:11","3:vg.ai.cu:10:11","2:vg.ai:11:11","2:vg.ai:11:11","1:vg.ak:11:11","1:vg.ak:0:11","1:vg.ak:0:11","2:vg.ak.ag:1:11","5:vg.ab.ag.cu:1:11","3:vg.ab:2:11","3:vg.ab:2:11","4:vg.ab.ag:3:11","4:vg.ab.ag:3:11","3:vg.ab:4:11","3:vg.ab:4:11","4:vg.ab.cu:4:11","3:vg.ab:5:11","3:vg.ab:5:11","4:vg.ab.ag:6:11","0:vz.ad.ag:6:0","-2:vz.ad.az:7:0","-2:vz.ai.az:7:0","0:vz.ai.cu:8:0","-1:vz.ai:8:0","-1:vz.ai:8:0","-2:vz.ai.az:9:0","-2:vz.ai.az:9:0","-1:vz.ai:10:0","-1:vz.ai:10:0","0:vz.ai.cu:10:0","-1:vz.ai:11:0","-1:vz.ai:11:0","-1:vz.ai:0:0","-1:vz.ai:0:0","-1:vz.ak.ag:1:0","-1:vz.ak.ag:1:0","-1:vz.ak.cu:2:0","0:vz.ab:2:0","0:vz.ab:2:0","1:vz.ab.ag:3:0","1:vz.ab.ag:3:0","0:vz.ab:4:0","0:vz.ab:4:0","1:vz.ab.cu:5:0","3:vg.ab:5:1","4:vg.ab.ag:6:1","4:vg.ab.ag:6:1","2:vg.ab.az:7:1","1:vg.ad.az:7:1","1:vg.ad.az:7:1","3:vg.ad.cu:8:1","2:vg.ai:8:1","1:vg.ai.az:9:1","1:vg.ai.az:9:1","2:vg.ai:10:1","2:vg.ai:10:1","2:vg.ai:10:1","3:vg.ai.cu:11:1","2:vg.ai:11:1","2:vg.ai:0:1","2:vg.ai:0:1","2:vg.ai:0:1","3:vg.ai.ag:1:1","2:vg.ak.ag:1:1","2:vg.ak.cu:2:1","1:vg.ak:2:1","4:vg.ab.ag:3:1","4:vg.ab.ag:3:1","3:vg.ab:4:1","-1:mi.ab:4:2","-1:mi.ab:5:2","-1:mr.ab.cu:5:2","-1:mr.ab.ag:6:2","-1:mr.ab.ag:6:2","-3:mr.ab.az:7:2","-3:mr.ab.az:7:2","-3:mr.ab.az:7:2","-2:mr.ab:8:2","-2:mr.ad.cu:8:2","-4:mr.ad.az:9:2","-4:mr.ai.az:9:2","-4:mr.ai.az:9:2","-3:mr.ai:10:2","-3:mr.ai:10:2","-3:mr.ai:11:2","-2:mr.ai.cu:11:2","-3:mr.ai:11:2","-3:mr.ai:0:2","-3:mr.ai:0:2","-2:mr.ai.ag:1:2","-2:mr.ai.ag:1:2","-3:mr.ai:2:2","-2:mr.ai.cu:2:2","-3:mr.ak.ag:3:3","-3:mr.ak.ag:3:3","-3:mi.ak:4:3","-1:mi.ab:4:3","1:ab:5:3","1:ab:5:3","3:ab.ag.cu:6:3","2:ab.ag:6:3","2:ab.ag:6:3","0:ab.az:7:3","0:ab.az:7:3","1:ab:8:3","-2:ty.ab:8:3","-2:ty.ab.az.cu:9:3","-4:ty.ad.az:9:3","-5:tg.ad.az:9:3","-3:ty.ad:10:3","-3:ty.ai:10:3","-3:ty.ai:10:3","-1:ts.ai:11:3","0:ts.ai.cu:11:3","-1:ts.ai:0:3","-1:ts.ai:0:3","0:ts.ai.ag:1:3","0:ts.ai.ag:1:3","0:ts.ai.ag:1:4","-1:ts.ai:2:4","-2:ty.ai.cu:2:4","-2:ty.ai.ag:3:4","-3:ty.ak.ag:3:4","-5:tg.ak:4:4","-4:ty.ak:4:4","-2:ty.ab:5:4","-2:ty.ab:5:4","2:ts.ab.ag.cu:6:4","1:ts.ab.ag:6:4","-1:ts.ab.az:7:4","-1:ts.ab.az:7:4","0:ts.ab:8:4","0:ts.ab:8:4","0:ts.ab:8:4","0:ts.ab.az.cu:9:4","-3:ty.ab.az:9:4","-2:ty.ab:10:4","-3:ty.ad:10:4","-4:tg.ad:10:4","-3:ty.ad:11:4","-3:ty.ai:11:4","-2:ty.ai.cu:0:4","-1:vz.ai:0:5","-1:vz.ai:0:5","0:vz.ai.ag:1:5","0:vz.ai.ag:1:5","-1:vz.ai:2:5","-1:vz.ai:2:5","1:vz.ai.ag.cu:3:5","0:vz.ai.ag:3:5","-1:vz.ai:4:5","-2:vz.ak:4:5","-2:vz.ak:5:5","-2:vz.ak:5:5","1:vz.ab.ag:6:5","2:vz.ab.ag.cu:6:5","-1:vz.ab.az:7:5","-1:vz.ab.az:7:5","-1:vz.ab.az:7:5","0:vz.ab:8:5","0:vz.ab:8:5","-1:vz.ab.az:9:5","0:vz.ab.az.cu:9:5","-1:vz.ab.az:9:5","0:vz.ab:10:5","0:vz.ab:10:5","3:vg.ab:11:6","2:vg.ad:11:6","2:vg.ad:11:6","3:vg.ai.cu:0:6","2:vg.ai:0:6","3:vg.ai.ag:1:6","3:vg.ai.ag:1:6","2:vg.ai:2:6","2:vg.ai:2:6","3:vg.ai.ag:3:6","4:vg.ai.ag.cu:3:6","3:vg.ai.ag:3:6","2:vg.ai:4:6","2:vg.ai:4:6","2:vg.ai:5:6","1:vg.ak:5:6","2:vg.ak.ag:6:6","3:vg.ak.ag.cu:6:6","2:vg.ab.az:7:6","2:vg.ab.az:7:6","3:vg.ab:8:6","3:vg.ab:8:6","0:mi.vg.ab.az:9:6","0:mi.vg.ab.az:9:6","-3:mr.vz.ab.az.cu:9:7","-3:mr.vz.ab:10:7","-3:mr.vz.ab:10:7","-3:mr.vz.ab:11:7","-3:mr.vz.ab:11:7","-3:mr.vz.ab:11:7","-4:mr.vz.ad:0:7","-3:mr.vz.ad.cu:0:7","-3:mr.vz.ad.ag:1:7","-3:mr.vz.ai.ag:1:7","-4:mr.vz.ai:2:7","-4:mr.vz.ai:2:7","-4:mr.vz.ai:2:7","-3:mr.vz.ai.ag:3:7","-2:mr.vz.ai.ag.cu:3:7","-4:mr.vz.ai:4:7","-4:mr.vz.ai:4:7","-4:mr.vz.ai:5:7","-4:mr.vz.ai:5:7","-3:mr.vz.ai.ag:6:7","-4:mr.vz.ak.ag:6:7","-4:mi.vz.ak.az.cu:7:7","-3:vz.ak.az:7:7","0:vz.ab:8:7","1:ab:8:8","1:ab:8:8","0:ab.az:9:8","0:ab.az:9:8","2:ab.cu:10:8","1:ab:10:8","1:ab:10:8","1:ab:11:8","1:ab:11:8","1:ab:0:8","1:ab:0:8","2:ab.cu:0:8","1:ad.ag:1:8","1:ad.ag:1:8","0:ai:2:8","0:ai:2:8","1:ai.ag:3:8","1:ai.ag:3:8","1:ai.cu:4:8","0:ai:4:8","0:ai:5:8","0:ai:5:8","1:ai.ag:6:8","1:ai.ag:6:8","-1:ai.az:7:9","0:ai.az.cu:7:9","-2:ak.az:7:9","-1:ak:8:9","-1:ak:8:9","0:ab.az:9:9","0:ab.az:9:9","0:ab.az:9:9","2:ab.cu:10:9","1:ab:10:9","1:ab:11:9","1:ab:11:9","1:ab:11:9","1:ab:0:9","1:ab:0:9","3:ab.ag.cu:1:9","2:ab.ag:1:9","1:ab:2:9","0:ad:2:9","1:ad.ag:3:9","1:ai.ag:3:9","0:ai:4:9","1:ai.cu:4:9","0:ai:5:9","0:ai:5:9","0:ai:5:10","1:ai.ag:6:10","1:ai.ag:6:10","-1:ai.az:7:10","0:ai.az.cu:7:10","0:ai:8:10","-1:ak:8:10","-2:ak.az:9:10","-2:ak.az:9:10","-2:ak.az:9:10","1:ab:10:10","2:ab.cu:10:10","1:ab:11:10","1:ab:11:10","1:ab:11:10","1:ab:0:10","1:ab:0:10","2:ab.ag:1:10","3:ab.ag.cu:1:10","2:ab.ag:1:10","-2:ty.ab:2:10","-2:ty.ab:2:10","-2:ty.ad.ag:3:10","-3:tg.ad.ag:3:10","-1:ty.vg.ai:4:11","0:ty.vg.ai.cu:4:11","-1:ty.vg.ai:5:11","1:ts.vg.ai:5:11","2:ts.vg.ai.ag:6:11","2:ts.vg.ai.ag:6:11","0:ts.vg.ai.az:7:11","0:ts.vg.ai.az:7:11","2:ts.vg.ai.cu:8:11","1:ts.vg.ai:8:11","-3:ty.mi.vg.ai:8:11","-5:ty.mr.vg.ai.az:9:11","-6:ty.mr.vg.ak.az:9:11","-6:tg.mr.vg.ak:10:11","-5:ty.mr.vg.ak:10:11","-2:ty.mr.vg.ab.cu:10:11","-3:ty.mr.vg.ab:11:11","0:mr.vg.ab:11:11","0:mr.vg.ab:0:11","0:mr.vg.ab:0:11","0:mr.vg.ab:0:11","1:mr.vg.ab.ag:1:11","2:mr.vg.ab.ag.cu:1:11","0:mr.vg.ab:2:11","0:mr.vg.ab:2:11","-2:mr.vz.ab.ag:3:0","-2:mr.vz.ab.ag:3:0","-3:mr.vz.ab:4:0","-4:mr.vz.ad:4:0","-3:mr.vz.ad.cu:5:0","-4:mr.vz.ai:5:0","-3:mr.vz.ai.ag:6:0","-3:mr.vz.ai.ag:6:0","-4:mi.vz.ai.az:7:0","-2:vz.ai.az:7:0","-1:vz.ai:8:0","0:vz.ai.cu:8:0","-1:vz.ai:8:0","-2:vz.ai.az:9:0","-2:vz.ai.az:9:0","-1:vz.ai:10:0","-1:vz.ai:10:0","-2:vz.ak:10:0","-1:vz.ak.cu:11:0","-2:vz.ak:11:0","0:vz.ab:0:0","0:vz.ab:0:0","0:vz.ab:0:0","1:vz.ab.ag:1:0","1:vz.ab.ag:1:0","1:vz.ab.cu:2:0","0:vz.ab:2:0","3:vg.ab:2:1","4:vg.ab.ag:3:1","4:vg.ab.ag:3:1","3:vg.ab:4:1","3:vg.ab:4:1","3:vg.ad.cu:5:1","2:vg.ad:5:1","3:vg.ai.ag:6:1","3:vg.ai.ag:6:1","1:vg.ai.az:7:1","1:vg.ai.az:7:1","2:vg.ai:8:1","3:vg.ai.cu:8:1","1:vg.ai.az:9:1","1:vg.ai.az:9:1","1:vg.ai.az:9:1","2:vg.ai:10:1","2:vg.ai:10:1","2:vg.ai:11:1","2:vg.ak.cu:11:1","1:vg.ak:11:1","1:vg.ak:0:1","1:vg.ak:0:1","4:vg.ab.ag:1:1","4:vg.ab.ag:1:1","4:vg.ab.ag:1:1","4:vg.ab.cu:2:1","3:vg.ab:2:1","4:vg.ab.ag:3:1","4:vg.ab.ag:3:1","1:ab:4:2","1:ab:4:2","1:ab:5:2","2:ab.cu:5:2","1:ad.ag:6:2","1:ad.ag:6:2","-1:ad.az:7:2","-1:ai.az:7:2","0:ai:8:2","0:ai:8:2","0:ai.az.cu:9:2","-1:ai.az:9:2","-1:ai.az:9:2","0:ai:10:2","0:ai:10:2","0:ai:11:2","0:ai:11:2","1:ai.cu:11:2","0:ai:0:2","-1:ak:0:2","0:ak.ag:1:2","0:ak.ag:1:2","0:ak.ag:1:2","1:ab:2:2","2:ab.cu:2:2","2:ab.ag:3:2","2:ab.ag:3:2","1:ab:4:2","1:ab:4:2","1:ab:5:2","1:ab:5:2","3:ab.ag.cu:6:2","2:ab.ag:6:2","2:ab.ag:6:2","-1:ad.az:7:2","-1:ad.az:7:2","0:ai:8:2","-4:vr.ai:8:2","-4:vr.ai.az.cu:9:2","-5:vr.ai.az:9:2","-4:vr.ai:10:2","-4:vr.ai:10:2","-4:vr.ai:10:2","-4:vr.ai:11:2","-4:vr.ai:11:2","-3:vr.ai.cu:0:2","-6:vr.mi.ai:0:2","-7:vr.mr.ai:0:2","-6:vr.mr.ai.ag:1:2","-7:vr.mr.ak.ag:1:2","-8:vr.mr.ak:2:2","-8:vr.mr.ak:2:2","-4:vr.mr.ab.ag.cu:3:2","-5:vr.mr.ab.ag:3:2","-6:vr.mr.ab:4:2","-6:vr.mr.ab:4:2","-6:vr.mr.ab:4:2","-6:vr.mr.ab:5:2","-6:vr.mr.ab:5:2","-4:vr.mr.ab.ag.cu:6:2","-5:vr.mr.ab.ag:6:2","-7:vr.mr.ab.az:7:2","-7:vr.mr.ab.az:7:2","-7:vr.mr.ad:8:2","-7:vr.mr.ad:8:2","-8:vr.mr.ai.az:9:2","-7:vr.mr.ai.az.cu:9:2","-8:vr.mr.ai.az:9:2","-7:vr.mr.ai:10:2","-7:vr.mr.ai:10:2","-7:vr.mr.ai:11:2","-6:vr.mi.ai:11:2","-6:vr.mi.ai:11:2","-3:vr.ai.cu:0:2","-4:vr.ai:0:2","-3:vr.ai.ag:1:2","-3:vr.ai.ag:1:2","-4:vr.ai:2:2","-5:vr.ak:2:2","-5:vr.ak:2:2","1:ak.ag.cu:3:2","2:ab.ag:3:2","1:ab:4:2","1:ab:4:2","1:ab:5:2","1:ab:5:2","2:ab.ag:6:2","3:ab.ag.cu:6:2","0:ab.az:7:2","0:ab.az:7:2","-2:ty.ab:8:2","-2:ty.ab:8:2","-3:ty.ad:8:2","-5:tg.ad.az:9:2","-3:ty.ad.az.cu:9:2","-3:ty.ai:10:2","-3:ty.ai:10:2","-1:ts.ai:11:2","-1:ts.ai:11:2","-1:ts.ai:11:2","-1:ts.ai:0:2","0:ts.ai.cu:0:2","0:ts.ai.ag:1:2","0:ts.ai.ag:1:2","0:ts.ai.ag:1:2","-1:ts.ai:2:2","-3:ty.ai:2:2","-2:ty.ai.ag:3:2","-2:ty.ak.ag.cu:3:2","-5:tg.ak:4:2","-4:ty.ak:4:2","-2:ty.ab:5:2","-2:ty.ab:5:2","2:ab.ag:6:2","2:ab.ag:6:2","1:ab.az.cu:7:2","0:ab.az:7:2","1:ab:8:2","1:ab:8:2","1:ab:8:2","0:ab.az:9:2","0:ab.az:9:2","1:ad.cu:10:2","0:ad:10:2","0:ad:10:2","0:ai:11:2","0:ai:11:3","0:ai:0:3","0:ai:0:3","1:ai.cu:0:3","1:ai.ag:1:3","1:ai.ag:1:3","0:ai:2:3","0:ai:2:3","1:ai.ag:3:3","1:ai.ag:3:3","2:ai.ag.cu:3:3","-1:ak:4:3","-1:ak:4:3","-1:ak:5:3","1:ab:5:3","2:ab.ag:6:3","2:ab.ag:6:3","1:ab.az.cu:7:3","0:ab.az:7:3","1:ab:8:3","1:ab:8:3","0:ab.az:9:3","0:ab.az:9:3","1:ab:10:3","2:ab.cu:10:3","1:ab:10:3","0:ad:11:3","0:ad:11:3","0:ai:11:3","0:ai:0:4","0:ai:0:4","2:ai.ag.cu:1:4","1:ai.ag:1:4","0:ai:2:4","0:ai:2:4","0:ai:2:4","1:ai.ag:3:4","1:ai.ag:3:4","1:ai.cu:4:4","0:ai:4:4","-1:ak:5:4","-3:mi.ak:5:4","-2:mi.ak.ag:6:4","-1:mr.ab.ag:6:4","-3:mr.ab.az:7:4","-2:mr.ab.az.cu:7:4","-2:mr.ab:8:4","-2:mr.ab:8:4","-3:mr.ab.az:9:4","-3:mr.ab.az:9:4","-3:mr.ab.az:9:4","-2:mr.ab:10:4","-1:mr.ab.cu:10:4","-2:mr.ab:11:4","-2:mr.ab:11:4","-4:mr.vz.ad:11:5","-4:mr.vz.ad:0:5","-4:mr.vz.ad:0:5","-3:mr.vz.ai.ag:1:5","-2:mr.vz.ai.ag.cu:1:5","-3:mr.vz.ai.ag:1:5","-4:mr.vz.ai:2:5","-4:mr.vz.ai:2:5","-3:mr.vz.ai.ag:3:5","-2:mi.vz.ai.ag:3:5","-3:mi.vz.ai:4:5","0:vz.ai.cu:4:5","-1:vz.ai:5:5","-1:vz.ai:5:5","0:vz.ai.ag:6:5","-1:vz.ak.ag:6:5","-3:vz.ak.az:7:5","-3:vz.ak.az:7:5","1:vz.ab.cu:8:5","0:vz.ab:8:5","0:vz.ab:8:5","-1:vz.ab.az:9:5","-1:vz.ab.az:9:5","0:vz.ab:10:5","0:vz.ab:10:5","1:vz.ab.cu:10:5","3:vg.ab:11:6","3:vg.ab:11:6","3:vg.ab:0:6","3:vg.ab:0:6","2:vg.ad:0:6","3:vg.ad.ag:1:6","4:vg.ad.ag.cu:1:6","2:vg.ai:2:6","2:vg.ai:2:6","3:vg.ai.ag:3:6","3:vg.ai.ag:3:6","3:vg.ai.ag:3:6","2:vg.ai:4:6","3:vg.ai.cu:4:6","2:vg.ai:5:6","2:vg.ai:5:6","3:vg.ai.ag:6:6","3:vg.ai.ag:6:6","0:vg.ak.az:7:6","0:vg.ak.az:7:6","2:vg.ak.cu:8:6","3:vg.ab:8:6","2:vg.ab.az:9:6","2:vg.ab.az:9:6","0:vz.ab:10:7","0:vz.ab:10:7","0:vz.ab:10:7","1:vz.ab.cu:11:7","0:vz.ab:11:7","0:vz.ab:0:7","0:vz.ab:0:7","0:vz.ab:0:7","1:vz.ab.ag:1:7","1:vz.ab.ag:1:7","0:vz.ad.cu:2:7","-1:vz.ad:2:7","-1:vz.ai:2:7","0:vz.ai.ag:3:7","0:vz.ai.ag:3:7","-1:vz.ai:4:7","-1:vz.ai:4:7","0:vz.ai.cu:5:7","-1:vz.ai:5:7","0:vz.ai.ag:6:7","0:vz.ai.ag:6:7","-2:vz.ai.az:7:7","-2:vz.ai.az:7:7","-1:vz.ai:8:7","0:ak.cu:8:8","-2:ak.az:9:8","-2:ak.az:9:8","0:ab.az:9:8","1:ab:10:8","1:ab:10:8","1:ab:11:8","2:ab.cu:11:8","1:ab:11:8","1:ab:0:8","1:ab:0:8","2:ab.ag:1:8","2:ab.ag:1:8","-1:ty.ab.ag:1:8","-1:ty.ab.cu:2:8","-3:ty.ad:2:8","-3:tg.ad.ag:3:8","-2:ty.ad.ag:3:8","0::0:0"]}; if (!D) return;
  var VS = "︎";
  var BN = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
  var GL = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  var AYL = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  var GUN = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  var SINIF = [["kacin","Tercih edilmez"],["notr","İdare eder"],["uygun","Uygun"],["cok","Çok uygun"]];
  var NEDEN = {
    tg:["-","Tutulma günü. Gelenekte yeni başlangıçlar için tercih edilmez."],
    ty:["-","Bir tutulmaya üç günden yakın; gökyüzü dalgalı."],
    ts:["-","İki tutulma arasındaki tutulma sezonunun içinde."],
    vr:["-","Venüs retrosu. Aşk gezegeni geri giderken evlilik gelenekte en çok kaçınılan dönemdir."],
    mr:["-","Merkür retrosu. İmza, söz ve resmi işlemler için tercih edilmez."],
    mi:["-","Merkür yön değiştiriyor; iletişim bulanık olabilir."],
    ar:["-","Mars geri gidiyor; aceleye gelen kararlar için uygun değil."],
    vg:["+","Venüs {v} burcunda güçlü. Aşk gezegeni kendi alanında."],
    vz:["-","Venüs {v} burcunda zayıf sayılır."],
    ak:["-","Karanlık Ay, yani yeni ay civarı; başlangıç enerjisi düşük."],
    ab:["+","Ay büyüyor. Gelenekte büyüme ve bereket için tercih edilen evre."],
    ad:["~","Dolunay. Duygular yoğun, kutlama enerjisi yüksek."],
    ai:["~","Ay küçülüyor; sakin ve içe dönük bir evre."],
    ag:["+","Ay {a} burcunda; duygusal uyum ve huzur."],
    az:["-","Ay {a} burcunda; duygular ağırlaşabilir."],
    cu:["+","Cuma, gelenekte Venüs'ün günü."]
  };
  var red = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T0 = ymd(D.t0), GUNSAY = D.S.length;
  function ymd(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function idx(d) { return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(T0.getFullYear(), T0.getMonth(), T0.getDate())) / 864e5); }
  function trT(d, g) { return d.getDate() + " " + AYL[d.getMonth()] + " " + d.getFullYear() + (g ? " " + GUN[d.getDay()] : ""); }
  function veri(d) { var i = idx(d); if (i < 0 || i >= GUNSAY) return null; var p = D.S[i].split(":"); return { top: +p[0], kod: p[1] ? p[1].split(".") : [], ms: +p[2], vs: +p[3] }; }
  function sinif(t) { return t >= 3 ? 3 : t >= 1 ? 2 : t >= -1 ? 1 : 0; }
  var es = [null, null]; // eşlerin Güneş burçları
  try { var k = JSON.parse(localStorage.getItem("ay_dugun_es") || "null"); if (k && k.length === 2) es = k; } catch (e) {}
  function kisisel(v) {   // çiftin burçlarına göre ek puan
    var ek = [], p = 0;
    es.forEach(function (s, n) {
      if (s === null || s === "") return; s = +s; var f = ((v.ms - s) % 12 + 12) % 12, kim = n === 0 ? "1. kişinin" : "2. kişinin";
      if (f === 0 || f === 4 || f === 8) { p++; ek.push(["+", "Ay, " + kim + " burcu " + BN[s] + " ile " + (f === 0 ? "aynı burçta" : "aynı elementte (üçgen)") + "; duygusal uyum destekleniyor."]); }
      else if (f === 3 || f === 9 || f === 6) { p--; ek.push(["-", "Ay, " + kim + " burcu " + BN[s] + " ile " + (f === 6 ? "karşıt" : "kare") + " konumda; o gün duygular daha gergin olabilir."]); }
      if (v.vs === s) { p++; ek.push(["+", "Venüs " + kim + " burcu " + BN[s] + " içinde; aşk gezegeni doğrudan destekliyor."]); }
    });
    return { p: p, ek: ek };
  }
  var sec = null, sonuc, tarihInp, M = {};
  function goster(d, kaydir) {
    var v = veri(d); if (!v) { sonuc.innerHTML = '<p class="y-kucuk">Lütfen 1 Ekim 2026 – 31 Aralık 2028 arasından bir tarih seç.</p>'; return; }
    sec = d; tarihInp.value = iso(d);
    var ks = kisisel(v), top = v.top + ks.p, sn = SINIF[sinif(top)];
    var li = v.kod.map(function (c) { var n = NEDEN[c]; return [n[0], n[1].replace("{v}", BN[v.vs]).replace("{a}", BN[v.ms])]; }).concat(ks.ek);
    var kalan = Math.round((d - new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) / 864e5);
    sonuc.innerHTML = '<div class="y-dg-kart ' + sn[0] + '"><div class="y-dg-rozet">' + sn[1] + '</div><div class="y-dg-t">' + trT(d, true) + '</div><div class="y-dg-mini">Ay ' + BN[v.ms] + " · Venüs " + BN[v.vs] + (kalan > 0 ? " · " + kalan + " gün kaldı" : "") + '</div><div class="dt-puan" aria-label="Puan">' + puanCubugu(top) + "</div></div>" +
      '<ul class="y-dg-n">' + li.map(function (x) { return '<li class="n' + (x[0] === "+" ? "a" : x[0] === "-" ? "e" : "n") + '">' + x[1] + "</li>"; }).join("") + "</ul>" +
      '<div class="y-btns"><button type="button" class="y-btn dt-pay">Bu tarihi paylaş</button><button type="button" class="y-btn y-ghost dt-ics">Takvimime ekle</button><button type="button" class="y-btn y-ghost dt-yakin">Yakındaki daha iyi günler</button></div><div class="dt-yakin-l"></div>';
    sonuc.querySelector(".dt-pay").onclick = paylas; sonuc.querySelector(".dt-ics").onclick = ics;
    sonuc.querySelector(".dt-yakin").onclick = function () { yakin(d); };
    try { history.replaceState(null, "", "#t=" + iso(d)); } catch (e) {}
    document.querySelectorAll(".dt-tv .gn.on").forEach(function (x) { x.classList.remove("on"); });
    var hc = document.querySelector('.dt-tv .gn[data-i="' + idx(d) + '"]'); if (hc) hc.classList.add("on");
    if (kaydir) sonuc.scrollIntoView({ behavior: red ? "auto" : "smooth", block: "center" });
    if (window.gtag) gtag("event", "dugun_tarih", { tarih: iso(d), sonuc: sn[0] });
  }
  function puanCubugu(t) { var p = Math.max(0, Math.min(100, (t + 8) / 14 * 100)); return '<span class="dt-bar"><i style="width:' + p.toFixed(0) + '%"></i></span><span class="dt-p">' + (t > 0 ? "+" : "") + t + "</span>"; }
  function yakin(d) {
    var l = [], i0 = idx(d);
    for (var i = Math.max(0, i0 - 21); i <= Math.min(GUNSAY - 1, i0 + 21); i++) { var g = new Date(T0.getFullYear(), T0.getMonth(), T0.getDate() + i); if (g < ymd("2026-10-01")) continue; var v = veri(g); l.push([g, v.top + kisisel(v).p]); }
    l.sort(function (a, b) { return b[1] - a[1] || Math.abs(idx(a[0]) - i0) - Math.abs(idx(b[0]) - i0); });
    var k = sonuc.querySelector(".dt-yakin-l");
    k.innerHTML = '<div class="y-dg-ay"><span>Üç hafta öncesi ve sonrasında en uyumlu günler:</span> ' + l.slice(0, 6).map(function (x) { return '<button type="button" class="cip" data-t="' + iso(x[0]) + '">' + trT(x[0], true) + "</button>"; }).join("") + "</div>";
    k.querySelectorAll("[data-t]").forEach(function (b) { b.onclick = function () { goster(ymd(b.dataset.t), false); }; });
  }
  function paylas() {
    var u = location.origin + location.pathname + "#t=" + iso(sec), m = trT(sec, true) + " düğün tarihi için astroloji ne diyor? " + u;
    if (navigator.share) navigator.share({ title: "Düğün tarihi kontrolü", text: m, url: u }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(m).then(function () { var b = sonuc.querySelector(".dt-pay"); b.textContent = "Bağlantı kopyalandı"; setTimeout(function () { b.textContent = "Bu tarihi paylaş"; }, 2200); });
  }
  function ics() {
    takvimAc({ ad: "Astro Yuvam · Büyük gün", olaylar: [[iso(sec), "Büyük gün", "Astro Yuvam düğün tarihi kontrolü"]], dosya: "buyuk-gun-" + iso(sec) + ".ics", url: "https://astroyuvam.com/dugun-tarihi-hesaplama.html#t=" + iso(sec) });
  }
  function takvimAc(opt) { if (window.AYTakvim) return window.AYTakvim.ac(opt); var s = document.createElement("script"); s.src = "/takvim-ekle.js"; s.onload = function () { window.AYTakvim.ac(opt); }; document.head.appendChild(s); }
  /* ---------- en iyi günleri bul ---------- */
  function bul(k) {
    var yil = k.querySelector(".dt-f-yil").value, ay = k.querySelector(".dt-f-ay").value, tip = k.querySelector(".dt-f-tip").value, l = [];
    for (var i = 0; i < GUNSAY; i++) {
      var g = new Date(T0.getFullYear(), T0.getMonth(), T0.getDate() + i); if (g < ymd("2026-10-01") || g > ymd("2028-12-31")) continue;
      if (yil !== "hepsi" && g.getFullYear() !== +yil) continue; if (ay !== "hepsi" && g.getMonth() !== +ay) continue;
      var w = g.getDay(); if (tip === "hs" && w !== 0 && w !== 6) continue; if (tip === "cch" && w !== 5 && w !== 6 && w !== 0) continue;
      var v = veri(g); l.push([g, v.top + kisisel(v).p]);
    }
    l.sort(function (a, b) { return b[1] - a[1] || a[0] - b[0]; });
    var out = k.querySelector(".dt-bul-l");
    if (!l.length) { out.innerHTML = '<p class="y-kucuk">Bu seçimle eşleşen gün yok.</p>'; return; }
    out.innerHTML = '<ol class="dt-liste">' + l.slice(0, 12).map(function (x) { var sn = SINIF[sinif(x[1])]; return '<li><button type="button" data-t="' + iso(x[0]) + '"><span class="dt-r ' + sn[0] + '"></span><b>' + trT(x[0], true) + "</b><em>" + sn[1] + " · " + (x[1] > 0 ? "+" : "") + x[1] + "</em></button></li>"; }).join("") + "</ol>";
    out.querySelectorAll("[data-t]").forEach(function (b) { b.onclick = function () { goster(ymd(b.dataset.t), true); }; });
  }
  /* ---------- renkli takvim ---------- */
  function takvim(k, yil) {
    var h = "", bas = yil === 2026 ? 9 : 0;
    for (var m = bas; m < 12; m++) {
      var ilk = new Date(yil, m, 1), bos = (ilk.getDay() + 6) % 7, n = new Date(yil, m + 1, 0).getDate();
      h += '<div class="ay"><div class="ay-ad">' + AYL[m] + '</div><div class="hg"><i>Pt</i><i>Sa</i><i>Ça</i><i>Pe</i><i>Cu</i><i>Ct</i><i>Pz</i>';
      for (var b = 0; b < bos; b++) h += "<span></span>";
      for (var d = 1; d <= n; d++) { var g = new Date(yil, m, d), v = veri(g), t = v.top + kisisel(v).p, sn = SINIF[sinif(t)]; h += '<button type="button" class="gn ' + sn[0] + '" data-i="' + idx(g) + '" aria-label="' + d + " " + AYL[m] + ": " + sn[1] + '">' + d + "</button>"; }
      h += "</div></div>";
    }
    k.innerHTML = h;
    if (sec) { var hc = k.querySelector('.gn[data-i="' + idx(sec) + '"]'); if (hc) hc.classList.add("on"); }
  }
  function uygulama(k) {
    var secenek = '<option value="">Seç (isteğe bağlı)</option>' + BN.map(function (b, i) { return '<option value="' + i + '">' + GL[i] + VS + " " + b + "</option>"; }).join("");
    k.innerHTML =
      '<div class="dt-ust"><label class="y-dg-l">Tarih <input type="date" lang="tr" min="2026-10-01" max="2028-12-31" class="dt-tarih"></label>' +
      '<label class="y-dg-l">1. kişinin burcu <select class="dt-es" data-n="0">' + secenek + '</select></label><label class="y-dg-l">2. kişinin burcu <select class="dt-es" data-n="1">' + secenek + "</select></label></div>" +
      '<div class="dt-sonuc" aria-live="polite"></div>' +
      '<div class="dt-blok"><div class="y-kutu-b">En uygun günleri bul</div><div class="dt-filtre">' +
      '<select class="dt-f-yil" aria-label="Yıl"><option value="hepsi">Tüm yıllar</option><option value="2026">2026 (Ekim – Aralık)</option><option value="2027" selected>2027</option><option value="2028">2028</option></select>' +
      '<select class="dt-f-ay" aria-label="Ay"><option value="hepsi">Tüm aylar</option>' + AYL.map(function (a, i) { return '<option value="' + i + '">' + a + "</option>"; }).join("") + "</select>" +
      '<select class="dt-f-tip" aria-label="Gün"><option value="hepsi">Her gün</option><option value="cch">Cuma, Cumartesi, Pazar</option><option value="hs" selected>Sadece hafta sonu</option></select>' +
      '<button type="button" class="y-btn dt-bul">Listele</button></div><div class="dt-bul-l"></div></div>' +
      '<div class="dt-blok"><div class="y-kutu-b">Renkli yıl takvimi</div><div class="dt-sekme" role="tablist"><button type="button" data-y="2026">2026</button><button type="button" data-y="2027" class="on">2027</button><button type="button" data-y="2028">2028</button></div><div class="y-tv dt-tv"></div>' +
      '<div class="y-tv-lej"><span class="cok">Çok uygun</span><span class="uygun">Uygun</span><span class="notr">İdare eder</span><span class="kacin">Tercih edilmez</span></div></div>';
    sonuc = k.querySelector(".dt-sonuc"); tarihInp = k.querySelector(".dt-tarih");
    var tv = k.querySelector(".dt-tv"), yil = 2027;
    k.querySelectorAll(".dt-es").forEach(function (s) { if (es[+s.dataset.n] !== null) s.value = es[+s.dataset.n]; s.onchange = function () { es[+s.dataset.n] = s.value === "" ? null : +s.value; try { localStorage.setItem("ay_dugun_es", JSON.stringify(es)); } catch (e) {} takvim(tv, yil); if (sec) goster(sec); if (k.querySelector(".dt-liste")) bul(k); }; });
    tarihInp.onchange = function () { if (tarihInp.value) goster(ymd(tarihInp.value)); };
    k.querySelector(".dt-bul").onclick = function () { bul(k); };
    k.querySelectorAll(".dt-sekme button").forEach(function (b) { b.onclick = function () { k.querySelectorAll(".dt-sekme button").forEach(function (x) { x.classList.toggle("on", x === b); }); yil = +b.dataset.y; takvim(tv, yil); }; });
    tv.addEventListener("click", function (e) { var b = e.target.closest(".gn"); if (!b) return; goster(new Date(T0.getFullYear(), T0.getMonth(), T0.getDate() + +b.dataset.i), true); });
    var h = /#t=(\d{4}-\d{2}-\d{2})/.exec(location.hash), ilk = h ? ymd(h[1]) : ymd("2027-05-15");
    if (!veri(ilk) || ilk < ymd("2026-10-01")) ilk = ymd("2027-05-15");
    if (ilk.getFullYear() !== 2027) { yil = ilk.getFullYear(); k.querySelectorAll(".dt-sekme button").forEach(function (x) { x.classList.toggle("on", +x.dataset.y === yil); }); }
    takvim(tv, yil); goster(ilk); bul(k);
  }
  function basla() { document.querySelectorAll("[data-dugun]").forEach(uygulama); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla); else basla();
})();

(window.webpackJsonp=window.webpackJsonp||[]).push([[323],{614:function(e,t){var n;(n=Prism).languages.tt2=n.languages.extend("clike",{comment:{pattern:/#.*|\[%#[\s\S]*?%\]/,lookbehind:!0},keyword:/\b(?:BLOCK|CALL|CASE|CATCH|CLEAR|DEBUG|DEFAULT|ELSE|ELSIF|END|FILTER|FINAL|FOREACH|GET|IF|IN|INCLUDE|INSERT|LAST|MACRO|META|NEXT|PERL|PROCESS|RAWPERL|RETURN|SET|STOP|TAGS|THROW|TRY|SWITCH|UNLESS|USE|WHILE|WRAPPER)\b/,punctuation:/[[\]{},()]/}),n.languages.insertBefore("tt2","number",{operator:/=[>=]?|!=?|<=?|>=?|&&|\|\|?|\b(?:and|or|not)\b/,variable:{pattern:/[a-z]\w*(?:\s*\.\s*(?:\d+|\$?[a-z]\w*))*/i}}),n.languages.insertBefore("tt2","keyword",{delimiter:{pattern:/^(?:\[%|%%)-?|-?%]$/,alias:"punctuation"}}),n.languages.insertBefore("tt2","string",{"single-quoted-string":{pattern:/'[^\\']*(?:\\[\s\S][^\\']*)*'/,greedy:!0,alias:"string"},"double-quoted-string":{pattern:/"[^\\"]*(?:\\[\s\S][^\\"]*)*"/,greedy:!0,alias:"string",inside:{variable:{pattern:/\$(?:[a-z]\w*(?:\.(?:\d+|\$?[a-z]\w*))*)/i}}}}),delete n.languages.tt2.string,n.hooks.add("before-tokenize",function(e){n.languages["markup-templating"].buildPlaceholders(e,"tt2",/\[%[\s\S]+?%\]/g)}),n.hooks.add("after-tokenize",function(e){n.languages["markup-templating"].tokenizePlaceholders(e,"tt2")})}}]);
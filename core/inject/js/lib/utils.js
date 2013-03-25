define([], function() {
	function buildTimestamp(inStamp) {
      var i, x, stamp, tmp, tz, d, dq;
      var dt = {};
      var today = new Date();
      dt.day = today.getDay();
      stamp = inStamp.replace(/,/,'').split(" ");
      for (i=0; i<stamp.length; i++) {
         if (/^\d{4}$/.test(stamp[i])) {
            dt.year = parseInt(stamp[i], 10);
         }
         else if (/\d{1,2}:\d{2}$/.test(stamp[i])) {
            tmp = stamp[i].match(/(\d{1,2}):(\d{2})/);
            dt.hours = parseInt(tmp[1], 10);
            dt.minutes = parseInt(tmp[2].replace(/^0/,''), 10);
         }
         else if (/\d{1,2}:\d{2}(am|pm)/i.test(stamp[i])) {
            tmp = stamp[i].match(/(\d{1,2}):(\d{2})/);
            if (/pm$/i.test(stamp[i])) {
               dt.hours = parseInt(tmp[1], 10)+12;
               if (dt.hours === 24) { dt.hours = 12; }
            }
            else {
               dt.hours = parseInt(tmp[1], 10);
               if (dt.hours === 12) { dt.hours = 0; }
            }
            dt.minutes = parseInt(tmp[2].replace(/^0/,''), 10);
         }
         else if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(stamp[i])) {
            tmp = stamp[i].match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            dt.date = parseInt(tmp[1], 10);
            dt.month = parseInt(tmp[2], 10);
            dt.year = parseInt(tmp[3], 10);
         }
         else if (/\d{1,2}(st|nd|rd|th)$/.test(stamp[i])) {
            tmp = stamp[i].match(/(\d{1,2})/);
            dt.date = parseInt(tmp[1], 10);
         }
         else if (/^[A-Za-z]+$/.test(stamp[i])) {
            var found = false;
            for (x=0; !found && x < module.getLocale("en")
                                       .monthsLong.length; x++) {
               if ((new RegExp(module.getLocale("en").monthsLong[x],"i"))
                     .test(stamp[i]) ||
                   (new RegExp(module.getLocale("en").monthsShort[x],"i"))
                     .test(stamp[i])) {
                  dt.month = x+1;
                  found = true;
               }
            }
            for (x=0; !found && x < module.getLocale("en")
                                       .daysLong.length; x++) {
               if ((new RegExp(module.getLocale("en").daysLong[x],"i"))
                     .test(stamp[i]) ||
                   (new RegExp(module.getLocale("en").daysShort[x], "i"))
                     .test(stamp[i])) {
                  dt.date = (x - dt.day - 7) % 7;
                  found = true;
               }
            }
         }
      }
      if (dt.year) {
         d = new Date(dt.month + "/" + dt.date + "/" + dt.year + " " +
                         dt.hours + ":" + dt.minutes + ":00");
         return Math.round(d.getTime()/1000);
      }
      if (!dt.year) {
         if (dt.month) {
            dq = new Date(dt.month + "/" + dt.date + "/" +
                              today.getFullYear() + " " + dt.hours +
                              ":" + dt.minutes + ":00");
            /* If more than a day ahead, month is in previous year */
            if (dq > today + 86400000) {
               dt.year = today.getFullYear() - 1;
            }
            else {
               dt.year = today.getFullYear();
            }
            d = new Date(dt.month + "/" + dt.date + "/" + dt.year +
                             " " + dt.hours + ":" + dt.minutes + ":00");
            return Math.round(d.getTime()/1000);
         }
         else if (dt.date < 0) {
            dq = new Date((today.getMonth()+1) + "/" +
                              today.getDate() + "/" +
                              today.getFullYear() + " " + dt.hours +
                              ":" + dt.minutes + ":00 UTC");
            /* If more than a month ahead, wrapped backwards across year */
            if (dq > today + 2764800000) {
               today.setFullYear(dt.year);
            }
            /* If more than a day ahead, wrapped backwards across month */
            if (dq > today + 86400000) {
               today.setMonth(today.getMonth()-1);
            }
            today = new Date(today.valueOf()+86400000*dt.date);
            dt.date = today.getDate();
            dt.month = today.getMonth()+1;
            dt.year = today.getFullYear();
            d = new Date(dt.month + "/" + dt.date + "/" + dt.year +
                             " " + dt.hours + ":" + dt.minutes + ":00");
            return Math.round(d.getTime()/1000);
         }
         else if (!dt.date) {
            dt.year = today.getFullYear();
            dt.month = today.getMonth()+1;
            dt.date = today.getDate();
            d = new Date(dt.month + "/" + dt.date + "/" + dt.year + " " +
                           dt.hours + ":" + dt.minutes + ":00");
            return Math.round(d.getTime()/1000);
         }
      }
      return null;
   }

    function getLocale(lang) {
      if (typeof lang !== "string") {
         lang = "en";
      }
      lang = lang.toLowerCase();
      if (module.locale.hasOwnProperty(lang) &&
          module.locale[lang] !== false) {
         return module.locale[lang];
      }
      else {
         if (!module.locale.hasOwnProperty(lang)) {
             module.locale[lang] = false;
            MissingE.debug("Warning: Localization not found for language '" +
                        lang + "'");
         }
         return module.locale.en;
      }
   }

   var locale = {
 "en": {
  "warningLink": {
   "link": "Read Missing-E statement regarding privacy and security",
   "subtext": "This link added by Missing e"
  },
  "daysLong": [
   "Sunday",
   "Monday",
   "Tuesday",
   "Wednesday",
   "Thursday",
   "Friday",
   "Saturday"
  ],
  "daysShort": [
   "Sun",
   "Mon",
   "Tue",
   "Wed",
   "Thu",
   "Fri",
   "Sat"
  ],
  "monthsLong": [
   "January",
   "February",
   "March",
   "April",
   "May",
   "June",
   "July",
   "August",
   "September",
   "October",
   "November",
   "December"
  ],
  "monthsShort": [
   "Jan",
   "Feb",
   "Mar",
   "Apr",
   "May",
   "Jun",
   "Jul",
   "Aug",
   "Sep",
   "Oct",
   "Nov",
   "Dec"
  ],
  "update": "Update Missing e",
  "postCrushes": "Post Your Crushes",
  "sidebar": {
   "posts": "Posts",
   "followers": "Followers",
   "messages": "Messages",
   "drafts": "Drafts",
   "queue": "Queue",
   "massEditor": "Mass Post Editor"
  },
  "myBlog": "my blog",
  "reblog": "reblog",
  "reblogging": "reblogging...",
  "reblogFailed": "Reblog failed!",
  "rebloggedText": "reblogged",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "Save draft"
   },
   {
    "item": "queue",
    "text": "Queue"
   },
   {
    "item": "private",
    "text": "Private"
   },
   {
    "item": "manual",
    "text": "Reblog manually"
   }
  ],
  "private": "Private",
  "captionText": "Caption",
  "tagsText": "Tags",
  "twitterText": "Send to Twitter",
  "facebookText": "Send to Facebook",
  "anonymous": "anonymous",
  "askPost": "Ask",
  "askPerson": ["Ask", "U"],
  "asked": ["U", "asked"],
  "reblogAsk": "Reblog Ask Post",
  "select": "Select",
  "first100": "First 100",
  "next100": "Next 100",
  "postTypeNames": {
   "text": "Text",
   "photo": "Photo",
   "quote": "Quote",
   "link": "Link",
   "chat": "Chat",
   "audio": "Audio",
   "video": "Video"
  },
  "reply": "Reply",
  "replying": "Replying...",
  "dashTweaksText": {
   "answer": "answer",
   "edit": "edit",
   "del": "delete",
   "reblog": "reblog",
   "reply": "reply",
   "notes": "notes",
   "queue": "queue",
   "publish": "publish",
   "experimental": "EXPERIMENTAL",
   "exp": "X"
  },
  "bookmarkVerb": "bookmark",
  "bookmarkNoun": "Bookmark",
  "bookmarksTitle": "Bookmarks",
  "postUnavailable": "Post Unavailable",
  "magnify": "magnify",
  "postingTweaks": {
   "submitText": {
    "publish": "Publish post",
    "queue": "Queue Post",
    "draft": "Save Draft",
    "private": "Save as Private"
   },
   "clearTagsText": "Clear Tags"
  },
  "reblogTags": "Reblog Tags",
  "removeTag": "Remove tag",
  "timestamps": {
   "failText": ["Timestamp loading failed.", "Retry"],
   "retryIndex": 1
  },
  "loading": "Loading...",
  "error": "An error occurred. Click to reload.",
  "posts": {
   "text": ["your", "post"],
   "photo": ["your", "photo"],
   "photoset": ["your", "photoset"],
   "quote": ["your", "quote"],
   "link": ["your", "link"],
   "conversation": ["your", "chat"],
   "audio": ["your", "audio post"],
   "video": ["your", "video"],
   "question": ["your", "question"]
  },
  "notifications": {
   "like": ["U", "liked", "P"],
   "reblog": ["U", "reblogged", "P"],
   "reblogIndex": 1,
   "answer": ["U", "answered", "P"],
   "reply": ["U", "replied to", "P"]
  },
  "replyType": {
   "as": "as ...",
   "photo": ["as ", "photo", ""],
   "photoTitle": "Photo Reply",
   "text": ["as ", "text", ""],
   "textTitle": "Text Reply"
  },
  "shuffle": "Shuffle Queue",
  "deleteConfirm": "Are you sure you want to delete this post?",
  "massDelete": {
   "selectAll": "Select All",
   "deselectAll": "Deselect All",
   "deleteSelected": "Delete Selected",
   "messagesConfirm": "Are you sure you want to delete the # selected messages?",
   "messagesError": "Some messages could not be deleted. Please try again later.",
   "postsConfirm": "Are you sure you want to delete the # selected posts?",
   "postsError": "Some posts could not be deleted. Please try again later.",
   "confirmReplace": {
    "operation": ["-", 1],
    "0": {
     "1 selected messages": "selected message",
     "1 selected posts": "selected post"
    }
   }
  },
  "sorting": {
   "sort": "Sort",
   "type": "Type",
   "user": "User",
   "reset": "Reset"
  }
 },
 "de": {
  "warningLink": {
   "link": "Lesen Sie den Missing-E Aussage über Privatsphäre und Sicherheit",
   "subtext": "Dieser Link hinzugefügt von Missing e"
  },
  "daysLong": [
   "Sonntag",
   "Montag",
   "Dienstag",
   "Mittwoch",
   "Donnerstag",
   "Freitag",
   "Samstag"
  ],
  "daysShort": [
   "So",
   "Mo",
   "Di",
   "Mi",
   "Do",
   "Fr",
   "Sa"
  ],
  "monthsLong": [
   "Januar",
   "Februar",
   "März",
   "April",
   "Mai",
   "Juni",
   "Juli",
   "August",
   "September",
   "Oktober",
   "November",
   "Dezember"
  ],
  "monthsShort": [
   "Jan",
   "Feb",
   "Mär",
   "Apr",
   "Mai",
   "Jun",
   "Jul",
   "Aug",
   "Sep",
   "Okt",
   "Nov",
   "Dez"
  ],
  "update": "Aktualisieren von Missing e",
  "postCrushes": "Veröffentlichen Sie Ihre Lieblinge",
  "sidebar": {
   "posts": "Einträge",
   "followers": "Follower",
   "messages": "Nachrichten",
   "drafts": "Entwürfe",
   "queue": "Warteschleife",
   "massEditor": "Mass Post Editor"
  },
  "myBlog": "meinem Blog",
  "reblog": "rebloggen",
  "reblogging": "rebloggend...",
  "reblogFailed": "Reblog ist fehlgeschlagen!",
  "rebloggedText": "gerebloggt",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "Entwurf speichern"
   },
   {
    "item": "queue",
    "text": "in die Warteschleife stellen"
   },
   {
    "item": "private",
    "text": "Privat"
   },
   {
    "item": "manual",
    "text": "manuell rebloggen"
   }
  ],
  "private": "Privat",
  "captionText": "Beschreibung",
  "tagsText": "Tags",
  "twitterText": "auf Twitter posten",
  "facebookText": "auf Facebook posten",
  "anonymous": "anonym",
  "askPost": "Fragen",
  "askPerson": ["Fragen Sie", "U"],
  "asked": ["U", "gefragt"],
  "reblogAsk": "Frage Eintrag rebloggen",
  "select": "Selektieren",
  "first100": "ersten 100",
  "next100": "nächsten 100",
  "postTypeNames": {
   "text": "Text",
   "photo": "Foto",
   "quote": "Zitat",
   "link": "Link",
   "chat": "Chat",
   "audio": "Audio",
   "video": "Video"
  },
  "reply": "Antworten",
  "replying": "Antworten...",
  "dashTweaksText": {
   "answer": "antworten",
   "edit": "bearbeiten",
   "del": "löschen",
   "reblog": "rebloggen",
   "reply": "antworten",
   "notes": "Anmerkungen",
   "queue": "in die Warteschleife stellen",
   "publish": "publizieren",
   "experimental": "EXPERIMENTELL",
   "exp": "X"
  },
  "bookmarkVerb": "Lesezeichen hinzufügen",
  "bookmarkNoun": "Lesezeichen",
  "bookmarksTitle": "Lesezeichen",
  "postUnavailable": "Beitrag nicht verfügbar",
  "magnify": "vergrößern",
  "postingTweaks": {
   "submitText": {
    "publish": "Eintrag publizieren",
    "queue": "in die Warteschleife stellen",
    "draft": "Entwurf speichern",
    "private": "Speichern als privat"
   },
   "clearTagsText": "Tags entfernen"
  },
  "reblogTags": "mit den Tags rebloggen",
  "removeTag": "Tag entfernen",
  "timestamps": {
   "failText": ["Zeitstempel Laden fehlgeschlagen.", "Wiederholen"],
   "retryIndex": 1
  },
  "loading": "wird geladen...",
  "error": "Ein Fehler ist aufgetreten. Klicken Sie, erneut zu versuchen.",
  "posts": {
   "text": ["deinen", "Eintrag"],
   "photo": ["dein", "Foto"],
   "photoset": ["deine", "Fotoserie"],
   "quote": ["dein", "Zitat"],
   "link": ["dein", "Link"],
   "conversation": ["dein", "Chat"],
   "audio": ["dein", "Audio-Eintrag"],
   "video": ["dein", "Video"],
   "question": ["deine", "Frage"]
  },
  "notifications": {
   "like": ["U", "hat", "P", "als Favorit markiert"],
   "reblog": ["U", "hat", "P", "gerebloggt"],
   "reblogIndex": 3,
   "answer": ["U", "hat", "P", "beantwortet"],
   "reply": ["U", "hat auf", "P", "geantwortet"]
  },
  "replyType": {
   "as": "als ...",
   "photo": ["als ", "Foto", ""],
   "photoTitle": "Foto Antwort",
   "text": ["als ", "Text", ""],
   "textTitle": "Text Antwort"
  },
  "shuffle": "Warteschleife mischen",
  "deleteConfirm": "Bist du sicher, dass du diesen Eintrag löchen willst?",
  "massDelete": {
   "selectAll": "Alle auswählen",
   "deselectAll": "Alle abwählen",
   "deleteSelected": "Auswählte löschen",
   "messagesConfirm": "Sind Sie sicher, dass Sie die # ausgewählten Nachrichten löschen wollen?",
   "messagesError": "Einige Nachrichten können nicht gelöscht werden. Bitte versuchen Sie es später erneut.",
   "postsConfirm": "Sind Sie sicher, dass Sie die # ausgewählten Einträge löschen wollen?",
   "postsError": "Einige Einträge können nicht gelöscht werden. Bitte versuchen Sie es später erneut.",
   "confirmReplace": {
    "operation": ["-", 1],
    "0": {
     "Nachrichten": "Nachricht",
     "Einträge": "Eintrag"
    }
   }
  },
  "sorting": {
   "sort": "Sortieren",
   "type": "Art",
   "user": "Benutzer",
   "reset": "Zurücksetzen"
  }
 },
 "es": {
  "warningLink": {
   "link": "Lea la declaración de Missing-E respecto a la privacidad y la seguridad",
   "subtext": "Este enlace añadido por Missing e"
  },
  "daysLong": [
   "Domingo",
   "Lunes",
   "Martes",
   "Miércoles",
   "Jueves",
   "Viernes",
   "Sábado"
  ],
  "daysShort": [
   "Dom",
   "Lun",
   "Mar",
   "Mié",
   "Jue",
   "Vie",
   "Sáb"
  ],
  "monthsLong": [
   "Enero",
   "Febrero",
   "Marzo",
   "Abril",
   "Mayo",
   "Junio",
   "Julio",
   "Agosto",
   "Septiembre",
   "Octubre",
   "Noviembre",
   "Diciembre"
  ],
  "monthsShort": [
   "Ene",
   "Feb",
   "Mar",
   "Abr",
   "May",
   "Jun",
   "Jul",
   "Ago",
   "Sep",
   "Oct",
   "Nov",
   "Dic"
  ],
  "update": "Actualización de Missing e",
  "postCrushes": "Publica tus flechazos",
  "sidebar": {
   "posts": "Publicaciones",
   "followers": "Seguidores",
   "messages": "Mensajes",
   "drafts": "Borradores",
   "queue": "En cola",
   "massEditor": "Mass Post Editor"
  },
  "myBlog": "mi blog",
  "reblog": "rebloguear",
  "reblogging": "reblogueando...",
  "reblogFailed": "¡El reblog falló!",
  "rebloggedText": "reblogueado",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "Guardar borrador"
   },
   {
    "item": "queue",
    "text": "Añadir a la cola"
   },
   {
    "item": "private",
    "text": "Privado"
   },
   {
    "item": "manual",
    "text": "Rebloguear manualmente"
   }
  ],
  "private": "Privado",
  "captionText": "Descripción",
  "tagsText": "Etiquetas",
  "twitterText": "Enviar a Twitter",
  "facebookText": "Enviar a Facebook",
  "anonymous": "anónimo",
  "askPost": "Preguntar",
  "askPerson": ["Preguntar a", "U"],
  "asked": ["U", "preguntó"],
  "reblogAsk": "Rebloguear Pregunta",
  "select": "Seleccionar",
  "first100": "Primeros 100",
  "next100": "Próximos 100",
  "postTypeNames": {
   "text": "Texto",
   "photo": "Foto",
   "quote": "Cita",
   "link": "Enlace",
   "chat": "Chat",
   "audio": "Audio",
   "video": "Vídeo"
  },
  "reply": "Responder",
  "replying": "Respondiendo...",
  "dashTweaksText": {
   "answer": "responder",
   "edit": "editar",
   "del": "borrar",
   "reblog": "rebloguear",
   "reply": "responder",
   "notes": "notas",
   "queue": "cola",
   "publish": "publicar",
   "experimental": "EXPERIMENTAL",
   "exp": "X"
  },
  "bookmarkVerb": "marcar",
  "bookmarkNoun": "Marcador",
  "bookmarksTitle": "Marcadores",
  "postUnavailable": "Publicación no disponible",
  "magnify": "agrandar",
  "postingTweaks": {
   "submitText": {
    "publish": "Crear publicación",
    "queue": "Poner publicación en cola",
    "draft": "Guardar borrador",
    "private": "Guardar como Privado"
   },
   "clearTagsText": "Quitar etiquetas"
  },
  "reblogTags": "Rebloguear etiquetas",
  "removeTag": "Eliminar etiqueta",
  "timestamps": {
   "failText": ["Carga de la marca de tiempo fallado.", "Vuelva a intentarlo"],
   "retryIndex": 1
  },
  "loading": "Cargando...",
  "error": "Se ha producido un error. Haga clic aquí para intentarlo de nuevo.",
  "posts": {
   "text": ["tu", "publicación"],
   "photo": ["tu", "foto"],
   "photoset": ["tu", "set de fotos"],
   "quote": ["tu", "cita"],
   "link": ["tu", "enlace"],
   "conversation": ["tu", "chat"],
   "audio": ["tu", "publicación de audio"],
   "video": ["tu", "vídeo"],
   "question": ["tu", "pregunta"]
  },
  "notifications": {
   "like": ["A", "U", "le gusta", "P"],
   "reblog": ["U", "ha reblogueado", "P"],
   "reblogIndex": 1,
   "answer": ["U", "ha contestado a", "P"],
   "reply": ["U", "ha respondido a", "P"]
  },
  "replyType": {
   "as": "como ...",
   "photo": ["como ", "una foto", ""],
   "photoTitle": "Respuesta en Foto",
   "text": ["como ", "texto", ""],
   "textTitle": "Respuesta en Texto"
  },
  "shuffle": "Barajar la cola",
  "deleteConfirm": "¿Seguro que quieres borrar esta publicación?",
  "massDelete": {
   "selectAll": "Seleccionar Todos",
   "deselectAll": "Deseleccionar Todos",
   "deleteSelected": "Eliminar Seleccionados",
   "messagesConfirm": "¿Está seguro que desea eliminar los # mensajes seleccionados?",
   "messagesError": "Algunos mensajes no se pudieron eliminar. Por favor, inténtelo de nuevo más tarde.",
   "postsConfirm": "¿Está seguro que desea eliminar las # publicaciones seleccionadas?",
   "postsError": "Algunos publicaciones no se pudieron eliminar. Por favor, inténtelo de nuevo más tarde.",
   "confirmReplace": {
    "operation": ["-", 1],
    "0": {
     "los 1 mensajes seleccionados": "el mensaje seleccionado",
     "las 1 publicaciones seleccionadas": "la publicación seleccionada"
    }
   }
  },
  "sorting": {
   "sort": "Ordenar",
   "type": "Tipo",
   "user": "Usuario",
   "reset": "Restablecer"
  }
 },
 "fr": {
  "warningLink": {
   "link": "Lire la déclaration de Missing-E concernant la confidentialité et la sécurité",
   "subtext": "Ce lien ajouté par Missing e"
  },
  "daysLong": [
   "Dimanche",
   "Lundi",
   "Mardi",
   "Mercredi",
   "Jeudi",
   "Vendredi",
   "Samedi"
  ],
  "daysShort": [
   "Dim",
   "Lun",
   "Mar",
   "Mer",
   "Jeu",
   "Ven",
   "Sam"
  ],
  "monthsLong": [
   "Janvier",
   "Février",
   "Mars",
   "Avril",
   "Mai",
   "Juin",
   "Juillet",
   "Août",
   "Septembre",
   "Octobre",
   "Novembre",
   "Décembre"
  ],
  "monthsShort": [
   "Janv",
   "Févr",
   "Mars",
   "Avr",
   "Mai",
   "Juin",
   "Juil",
   "Août",
   "Sept",
   "Oct",
   "Nov",
   "Déc"
  ],
  "update": "Mettre à jour Missing e",
  "postCrushes": "Publiez vos chouchous",
  "sidebar": {
   "posts": "Billets",
   "followers": "Abonnés",
   "messages": "Messages",
   "drafts": "Brouillons",
   "queue": "File d'attente",
   "massEditor": "Mass Post Editor"
  },
  "myBlog": "Blog principal",
  "reblog": "rebloguer",
  "reblogging": "rebloguant...",
  "reblogFailed": "Reblog a échoué!",
  "rebloggedText": "reblogué",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "Enregistrer le brouillon"
   },
   {
    "item": "queue",
    "text": "File d'attente"
   },
   {
    "item": "private",
    "text": "Privé"
   },
   {
    "item": "manual",
    "text": "Rebloguer manuellement"
   }
  ],
  "private": "Privé",
  "tagsText": "Tags",
  "captionText": "Description",
  "twitterText": "Publier sur Twitter",
  "facebookText": "Publier sur Facebook",
  "anonymous": "anonyme",
  "askPost": "Question",
  "askPerson": ["Demandez", "U"],
  "asked": ["U", "a demandé"],
  "reblogAsk": "Rebloguer la question",
  "select": "Sélectionner",
  "first100": "Première 100",
  "next100": "Prochaine 100",
  "postTypeNames": {
   "text": "Texte",
   "photo": "Photo",
   "quote": "Citation",
   "link": "Lien",
   "chat": "Discussion",
   "audio": "Audio",
   "video": "Vidéo"
  },
  "reply": "Envoyer",
  "replying": "Réaction en cours d'envoi...",
  "dashTweaksText": {
   "answer": "Répondre",
   "edit": "éditer",
   "del": "supprimer",
   "reblog": "rebloguer",
   "reply": "réagir",
   "notes": "notes",
   "queue": "file d'attente",
   "publish": "publier",
   "experimental": "EXPÉRIMENTALE",
   "exp": "X"
  },
  "bookmarkVerb": "marquer",
  "bookmarkNoun": "Signet",
  "bookmarksTitle": "Signets",
  "postUnavailable": "Billet Indisponible",
  "magnify": "agrandir",
  "postingTweaks": {
   "submitText": {
    "publish": "Publier le billet",
    "queue": "Ajouter à la file d'attente",
    "draft": "Enregistrer le brouillon",
    "private": "Sauvegarder privé"
   },
   "clearTagsText": "Supprimer Tags"
  },
  "reblogTags": "Rebloguer Tags",
  "removeTag": "Supprimer le tag",
  "timestamps": {
   "failText": ["Chargement de timestamp échoué.", "Réessayer"],
   "retryIndex": 1
  },
  "loading": "Pas prêt...",
  "error": "Une erreur s'est produite. Cliquez pour essayer à nouveau.",
  "posts": {
   "text": ["votre", "billet"],
   "photo": ["votre", "photo"],
   "photoset": ["votre", "diaporama"],
   "quote": ["votre", "citation"],
   "link": ["votre", "lien"],
   "conversation": ["votre", "discussion"],
   "audio": ["votre", "billet audio"],
   "video": ["votre", "vidéo"],
   "question": ["votre", "question"]
  },
  "notifications": {
   "like": ["U", "a ajouté", "P", "à ses coups de coeur"],
   "reblog": ["U", "a", "reblogué", "P"],
   "reblogIndex": 2,
   "answer": ["U", "a répondu à", "P"],
   "reply": ["U", "a réagi à", "P"]
  },
  "replyType": {
   "as": "changer le type de billet",
   "photo": ["", "photo", ""],
   "photoTitle": "Photo Réponse",
   "text": ["", "texte", ""],
   "textTitle": "Texte Réponse"
  },
  "shuffle": "Mélanger",
  "deleteConfirm": "Souhaitez-vous vraiment supprimer ce billet?",
  "massDelete": {
   "selectAll": "Tout sélectionner",
   "deselectAll": "Tout désélectionner",
   "deleteSelected": "Supprimer la sélection",
   "messagesConfirm": "Etes-vous sûr de vouloir supprimer les # messages sélectionnés?",
   "messagesError": "Certains messages n'ont pas pu être supprimé. S'il vous plaît essayez de nouveau plus tard.",
   "postsConfirm": "Etes-vous sûr de vouloir supprimer les # billets sélectionnés?",
   "postsError": "Certains billets n'ont pas pu être supprimé. S'il vous plaît essayez de nouveau plus tard.",
   "confirmReplace": {
    "operation": ["-", 1],
    "0": {
     "les 1 messages sélectionnés": "le message 1 sélectionné",
     "les 1 billets sélectionnés": "le billet sélectionné"
    }
   }
  },
  "sorting": {
   "sort": "Trier",
   "type": "Type",
   "user": "Utilisateur",
   "reset": "Réinitialiser"
  }
 },
 "it": {
  "warningLink": {
   "link": "Leggi la dichiarazione di Missing-E sulla privacy e la sicurezza",
   "subtext": "Questo link aggiunto da Missing e"
  },
  "daysLong": [
   "Domenica",
   "Lunedi",
   "Martedì",
   "Mercoledì",
   "Giovedi",
   "Venerdì",
   "Sabato"
  ],
  "daysShort": [
   "Dom",
   "Lun",
   "Mar",
   "Mer",
   "Gio",
   "Ven",
   "Sab"
  ],
  "monthsLong": [
   "Gennaio",
   "Febbraio",
   "Marzo",
   "Aprile",
   "Maggio",
   "Giugno",
   "Luglio",
   "Agosto",
   "Settembre",
   "Ottobre",
   "Novembre",
   "Dicembre"
  ],
  "monthsShort": [
   "Gen",
   "Feb",
   "Mar",
   "Apr",
   "Mag",
   "Giu",
   "Lug",
   "Ago",
   "Set",
   "Ott",
   "Nov",
   "Dic"
  ],
  "update": "Aggiornamento di Missing e",
  "postCrushes": "Pubblicare le tue cotte",
  "sidebar": {
   "posts": "Post",
   "followers": "Lettori",
   "messages": "Messagi",
   "drafts": "Bozze",
   "queue": "In Coda",
   "massEditor": "Mass Post Editor"
  },
  "myBlog": "il mio blog",
  "reblog": "reblogga",
  "reblogging": "rebloggando...",
  "reblogFailed": "Reblog fallito!",
  "rebloggedText": "rebloggato",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "Salva bozza"
   },
   {
    "item": "queue",
    "text": "Metti in coda"
   },
   {
    "item": "private",
    "text": "Privato"
   },
   {
    "item": "manual",
    "text": "Reblogga manualmente"
   }
  ],
  "private": "Privato",
  "tagsText": "Tag",
  "captionText": "Descrizione",
  "twitterText": "Posta su Twitter",
  "facebookText": "Posta su Facebook",
  "anonymous": "anonimo",
  "askPost": "Chiedi",
  "askPerson": ["Chiedi", "U"],
  "asked": ["U", "ha chiesto"],
  "reblogAsk": "Reblogga domanda",
  "select": "Seleziona",
  "first100": "Primi 100",
  "next100": "Successivi 100",
  "postTypeNames": {
   "text": "Testo",
   "photo": "Foto",
   "quote": "Citazione",
   "link": "Link",
   "chat": "Chat",
   "audio": "Audio",
   "video": "Video"
  },
  "reply": "Rispondi",
  "replying": "Rispondendo...",
  "dashTweaksText": {
   "answer": "rispondi",
   "edit": "modifica",
   "del": "elimina",
   "reblog": "reblogga",
   "reply": "rispondi",
   "notes": "note",
   "queue": "in coda",
   "publish": "pubblica",
   "experimental": "SPERIMENTALE",
   "exp": "SP"
  },
  "bookmarkVerb": "segnalibro",
  "bookmarkNoun": "Segnalibro",
  "bookmarksTitle": "Segnalibri",
  "postUnavailable": "Post Indisponibile",
  "magnify": "ingrandire",
  "postingTweaks": {
   "submitText": {
    "publish": "Pubblica post",
    "queue": "Metti post in coda",
    "draft": "Salva bozza",
    "private": "Salva post privato"
   },
   "clearTagsText": "Cancella i Tag"
  },
  "reblogTags": "Reblogga i Tag",
  "removeTag": "Rimuovi tag",
  "timestamps": {
   "failText": ["Caricamento del timestamp fallito.", "Riprova"],
   "retryIndex": 1
  },
  "loading": "In caricamento...",
  "error": "Si è verificato un errore. Clicca per provare di nuovo.",
  "posts": {
   "text": ["il", "tuo", "post"],
   "photo": ["la", "tua", "foto"],
   "photoset": ["il", "tuo", "fotoset"],
   "quote": ["la", "tua", "citazione"],
   "link": ["il", "tuo", "link"],
   "conversation": ["la", "tua", "chat"],
   "audio": ["il", "tuo", "post audio"],
   "video": ["il", "tuo", "video"],
   "question": ["la", "tua", "domanda"]
  },
  "notifications": {
   "like": ["A", "U", "piace", "P"],
   "reblog": ["U", "ha", "rebloggato", "P"],
   "reblogIndex": 2,
   "answer": ["U", "ha riposto", "P"],
   "reply": ["U", "ha riposto", "P"]
  },
  "notificationChanges": {
   "answer": {
    "il": "al",
    "la": "alla"
   },
   "reply": {
    "il": "al",
    "la": "alla"
   }
  },
  "replyType": {
   "as": "come ...",
   "photo": ["come ", "foto", ""],
   "photoTitle": "Rispondi con una foto",
   "text": ["come ", "testo", ""],
   "textTitle": "Rispondi con un testo"
  },
  "shuffle": "Mischiare la coda",
  "deleteConfirm": "Sei sicuro di voler eliminare questo post?",
  "massDelete": {
   "selectAll": "Seleziona tutto",
   "deselectAll": "Deseleziona tutto",
   "deleteSelected": "Elimina selezionati",
   "messagesConfirm": "Sei sicuro di voler eliminare i # messaggi selezionati?",
   "messagesError": "Alcuni messaggi non sono stati eliminati. Riprova più tardi.",
   "postsConfirm": "Sei sicuro di voler eliminare i # posti selezionati?",
   "postsError": "Alcuni posti non sono stati eliminati. Riprova più tardi.",
   "confirmReplace": {
    "operation": ["-", 1],
    "0": {
     "i 1 messaggi": "il messaggio",
     "i 1 posti": "il post"
    }
   }
  },
  "sorting": {
   "sort": "Ordinare",
   "type": "Tipo",
   "user": "Utente",
   "reset": "Resetta"
  }
 },
 "ja": {
  "warningLink": {
   "link": "プライバシーとセキュリティに関するMissing-Eの文を読む",
   "subtext": "このリンクは、Missing eによって追加されました"
  },
  "daysLong": [
   "日",
   "月",
   "火",
   "水",
   "木",
   "金",
   "土"
  ],
  "daysShort": [
   "日",
   "月",
   "火",
   "水",
   "木",
   "金",
   "土"
  ],
  "monthsLong": [
   "1月",
   "2月",
   "3月",
   "4月",
   "5月",
   "6月",
   "7月",
   "8月",
   "9月",
   "10月",
   "11月",
   "12月"
  ],
  "monthsShort": [
   "1月",
   "2月",
   "3月",
   "4月",
   "5月",
   "6月",
   "7月",
   "8月",
   "9月",
   "10月",
   "11月",
   "12月"
  ],
  "update": "Missing e を更新する",
  "postCrushes": "ラブリストを投稿",
  "sidebar": {
   "posts": "総合投稿数",
   "followers": "ファン",
   "messages": "メッセージ",
   "drafts": "下書き",
   "queue": "予約投稿",
   "massEditor": "Mass Post Editor"
  },
  "myBlog": "メインブログ",
  "reblog": "リブログ",
  "reblogging": "リブログ中...",
  "reblogFailed": "リブログに失敗しました!",
  "rebloggedText": "リブログしました",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "下書き保存"
   },
   {
    "item": "queue",
    "text": "キュー"
   },
   {
    "item": "private",
    "text": "プライベート"
   },
   {
    "item": "manual",
    "text": "手動でリブログ"
   }
  ],
  "private": "プライベート",
  "captionText": "説明",
  "tagsText": "タグ",
  "twitterText": "投稿を Twitter にも送信",
  "facebookText": "投稿を Facebook にも送信",
  "anonymous": "匿名の",
  "askPost": "質問",
  "askPerson": ["U", "尋ねる"],
  "asked": ["U", "は尋ねた"],
  "reblogAsk": "質問をリブログ",
  "select": "選択",
  "first100": "最初100",
  "next100": "今後100",
  "postTypeNames": {
   "text": "テキスト",
   "photo": "画像",
   "quote": "引用",
   "link": "リンク",
   "chat": "チャット",
   "audio": "音声",
   "video": "動画"
  },
  "reply": "返信",
  "replying": "返信中…",
  "dashTweaksText": {
   "answer": "回答する",
   "edit": "編集",
   "del": "削除",
   "reblog": "リブログ",
   "reply": "返信",
   "notes": "リアクション",
   "queue": "キュー",
   "publish": "公開",
   "experimental": "実験的",
   "exp": "実験"
  },
  "bookmarkVerb": "ブックマーク",
  "bookmarkNoun": "ブックマーク",
  "bookmarksTitle": "ブックマーク",
  "postUnavailable": "できない見つけること投稿",
  "magnify": "拡大する",
  "postingTweaks": {
   "submitText": {
    "publish": "投稿を公開",
    "queue": "キューに追加",
    "draft": "下書き保存",
    "private": "プライベート保存"
   },
   "clearTagsText": "タグをクリア"
  },
  "reblogTags": "タグをリブログ",
  "removeTag": "タグを除去する",
  "timestamps": {
   "failText": ["タイムスタンプのロードに失敗しました。", "再試行します"],
   "retryIndex": 1
  },
  "loading": "読込中...",
  "error": "エラーが発生しました。 クリックしてもう一度やり直してください。",
  "posts": {
   "text": ["投稿"],
   "photo": ["画像"],
   "photoset": ["フォトセット"],
   "quote": ["引用"],
   "link": ["リンク"],
   "conversation": ["チャット"],
   "audio": ["音声投稿"],
   "video": ["動画"],
   "question": ["質問"]
  },
  "notifications": {
   "like": ["U", " があなたの ", "P", " を「スキ!」と言っています"],
   "reblog": ["U", " があなたの ", "P", " を", "リブログ", "しました"],
   "reblogIndex": 4,
   "answer": ["U", " があなたの ", "P", " に回答しました"],
   "reply": ["U", " があなたの ", "P", " に返信しました"]
  },
  "replyType": {
   "as": "返信種別を選択",
   "photo": ["", "画像", ""],
   "photoTitle": "画像返信",
   "text": ["", "テキスト", ""],
   "textTitle": "テキスト返信"
  },
  "shuffle": "シャッフルキュー",
  "deleteConfirm": "本当に、この投稿を削除しますか?",
  "massDelete": {
   "selectAll": "すべて選択",
   "deselectAll": "すべて選択解除",
   "deleteSelected": "選択した項目を削除",
   "messagesConfirm": "あなたは # 選択したメッセージを削除してもよろしいですか？",
   "messagesError": "一部のメッセージが削除できませんでした。後でもう一度やり直してください。",
   "postsConfirm": "あなたは # 選択した投稿を削除してもよろしいですか？",
   "postsError": "一部の投稿が削除できませんでした。後でもう一度やり直してください。"
  },
  "sorting": {
   "sort": "ソート",
   "type": "タイプ",
   "user": "ユーザ",
   "reset": "リセット"
  }
 },
 "nl": {
  "warningLink": {
   "link": "Lees Missing-E verklaring met betrekking tot privacy en veiligheid.",
   "subtext": "Deze link toegevoegd door Missing e."
  },
  "daysLong": [
   "Zondag",
   "Maandag",
   "Dinsdag",
   "Woensdag",
   "Donderdag",
   "Vrijdag",
   "Zaterdag"
  ],
  "daysShort": [
   "Zo",
   "Ma",
   "Di",
   "Wo",
   "Do",
   "Vr",
   "Za"
  ],
  "monthsLong": [
   "Januari",
   "Februari",
   "Maart",
   "April",
   "Mei",
   "Juni",
   "Juli",
   "Augustus",
   "September",
   "Oktober",
   "November",
   "December"
  ],
  "monthsShort": [
   "Jan",
   "Feb",
   "Mrt",
   "Apr",
   "Mei",
   "Jun",
   "Jul",
   "Aug",
   "Sep",
   "Okt",
   "Nov",
   "Dec"
  ],
  "update": "Update Missing e",
  "postCrushes": "Plaats uw Crushes",
  "sidebar": {
   "posts": "Berichten",
   "followers": "Volgers",
   "messages": "Blogberichten",
   "drafts": "Concepten",
   "queue": "Wachtrij",
   "massEditor": "Mass Post Editor"
  },
  "myBlog": "mijn blog",
  "reblog": "rebloggen",
  "reblogging": "Bezig met rebloggen...",
  "reblogFailed": "Reblog is mislukt!",
  "rebloggedText": "gereblogd",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "Concept opslaan"
   },
   {
    "item": "queue",
    "text": "Wachtrij"
   },
   {
    "item": "private",
    "text": "Opslaan prive"
   },
   {
    "item": "manual",
    "text": "Reblog handmatig"
   }
  ],
  "private": "Privé",
  "captionText": "Bijschrift",
  "tagsText": "Tags",
  "twitterText": "Verstuur naar Twitter",
  "facebookText": "Verstuur naar Facebook",
  "anonymous": "anoniem",
  "askPost": "Vragen",
  "askPerson": ["Vraag", "U"],
  "asked": ["U", "vroeg"],
  "reblogAsk": "Reblog vraagbericht",
  "select": "Selecteren",
  "first100": "Eerste 100",
  "next100": "Volgende 100",
  "postTypeNames": {
   "text": "Tekst",
   "photo": "Foto",
   "quote": "Citaat",
   "link": "Link",
   "chat": "Chat",
   "audio": "Audio",
   "video": "Video"
  },
  "reply": "Reageren",
  "replying": "Bezig met reageren...",
  "dashTweaksText": {
   "answer": "antwoorden",
   "edit": "bewerken",
   "del": "verwijderen",
   "reblog": "rebloggen",
   "reply": "reageren",
   "notes": "notities",
   "queue": "in de wachtrij zetten",
   "publish": "publiceren",
   "experimental": "EXPERIMENTEEL",
   "exp": "X"
  },
  "bookmarkVerb": "markeren",
  "bookmarkNoun": "Bladwijzer",
  "bookmarksTitle": "Bladwijzers",
  "postUnavailable": "Post niet beschikbaar",
  "magnify": "vergroten",
  "postingTweaks": {
   "submitText": {
    "publish": "Publiceren",
    "queue": "Wachtrij",
    "draft": "Concept opslaan",
    "private": "Privé opslaan"
   },
   "clearTagsText": "Tags wissen"
  },
  "reblogTags": "Reblog Tags",
  "removeTag": "Tag verwijderen",
  "timestamps": {
   "failText": ["Tijdsaanduiding laden mislukt.", "Opnieuw proberen"],
   "retryIndex": 1
  },
  "loading": "Het laden...",
  "error": "Er is een fout opgetreden. Klik om te herladen.",
  "posts": {
   "text": ["je", "bericht"],
   "photo": ["je", "foto"],
   "photoset": ["je", "fotoset"],
   "quote": ["je", "citaat"],
   "link": ["je", "link"],
   "conversation": ["je", "chat"],
   "audio": ["je", "audiobericht"],
   "video": ["je", "video"],
   "question": ["je", "vraag"]
  },
  "notifications": {
   "like": ["U", "vindt", "P", "leuk"],
   "reblog": ["U", "heeft", "P", "gereblogd"],
   "reblogIndex": 3,
   "answer": ["U", "heeft", "P", "beantwoord"],
   "reply": ["U", "heeft gereageerd op", "P"]
  },
  "replyType": {
   "as": "als ...",
   "photo": ["as ", "foto", ""],
   "photoTitle": "Foto Antwoord",
   "text": ["as ", "tekst", ""],
   "textTitle": "Tekst Antwoord"
  },
  "shuffle": "Shuffle Wachtrij",
  "deleteConfirm": "Weet je zeker dat je dit bericht wilt verwijderen?",
  "massDelete": {
   "selectAll": "Selecteer Alle",
   "deselectAll": "Deselecterr Alle",
   "deleteSelected": "Verwijder Geselecteerde",
   "messagesConfirm": "Weet je zeker dat je de # geselecteerde berichten wilt verwijderen?",
   "messagesError": "Sommige berichten kunnen niet worden verwijderd. Probeer het later opnieuw.",
   "postsConfirm": "Weet je zeker dat je de # geselecteerde berichten wilt verwijderen?",
   "postsError": "Sommige berichten kunnen niet worden verwijderd. Probeer het later opnieuw.",
   "confirmReplace": {
    "operation": ["-", 1],
    "0": {
     "de 1 geselecteerde berichten": "het geselecteerde bericht"
    }
   }
  },
  "sorting": {
   "sort": "Sorteren",
   "type": "Type",
   "user": "Gebruiker",
   "reset": "Reset"
  }
 },
 "pl": {
  "warningLink": {
   "link": "Przeczytaj oświadczenie Missing-E dotyczące prywatności i bezpieczeństwa",
   "subtext": "Ten link został dodany przez Missing e"
  },
  "daysLong": [
   "niedziela",
   "poniedziałek",
   "wtorek",
   "środa",
   "czwartek",
   "piątek",
   "sobota"
  ],
  "daysShort": [
   "niedz",
   "pon",
   "wt",
   "śr",
   "czw",
   "pt",
   "sob"
  ],
  "monthsLong": [
   "styczeń",
   "luty",
   "marzec",
   "kwiecień",
   "maj",
   "czerwiec",
   "lipiec",
   "sierpień",
   "wrzesień",
   "październik",
   "listopad",
   "grudzień"
  ],
  "monthsShort": [
   "sty",
   "lut",
   "mar",
   "kwi",
   "maj",
   "cze",
   "lip",
   "sie",
   "wrz",
   "paź",
   "lis",
   "gru"
  ],
  "update": "Aktualizuj Misssing e",
  "postCrushes": "Publikuj swoje fascynacje",
  "sidebar": {
   "posts": "Posty",
   "followers": "Obserwatorzy",
   "messages": "Wiadomości",
   "drafts": "Wersje robocze",
   "queue": "Kolejka",
   "massEditor": "Mass Post Editor"
  },
  "myBlog": "moim blogu",
  "reblog": "rebloguj",
  "reblogging": "reblogowanie...",
  "reblogFailed": "Reblogowanie się nie powiodło!",
  "rebloggedText": "reblogował(a)",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "Wersję roboczą"
   },
   {
    "item": "queue",
    "text": "Dodaj do kolejki"
   },
   {
    "item": "private",
    "text": "Private"
   },
   {
    "item": "manual",
    "text": "Rebloguj ręcznie"
   }
  ],
  "private": "Private",
  "captionText": "Podpis",
  "tagsText": "tagi",
  "twitterText": "Wyślij na Twittera",
  "facebookText": "Wyślij na Facebook",
  "anonymous": "anonimowy",
  "askPost": "Pytanie",
  "askPerson": ["Pytać", "U"],
  "asked": ["U", "apytał(a)"],
  "reblogAsk": "Rebloguj pytanie",
  "select": "Zaznacz",
  "first100": "Pierwsze 100",
  "next100": "Następne 100",
  "postTypeNames": {
   "text": "Tekst",
   "photo": "Zdjęcie",
   "quote": "Cytat",
   "link": "Link",
   "chat": "Dialog",
   "audio": "Audio",
   "video": "Wideo"
  },
  "reply": "Komentuj",
  "replying": "Komentowanie...",
  "dashTweaksText": {
   "answer": "odpowiedz",
   "edit": "edytuj",
   "del": "usuń",
   "reblog": "rebloguj",
   "reply": "komentuj",
   "notes": "notek",
   "queue": "kolejkuj",
   "publish": "publikuj",
   "experimental": "EKSPERYMENTALNA",
   "exp": "X"
  },
  "bookmarkVerb": "Dodaj zakładkę",
  "bookmarkNoun": "Zakładka",
  "bookmarksTitle": "Zakładki",
  "postUnavailable": "Post niedostępny",
  "magnify": "powiększ",
  "postingTweaks": {
   "submitText": {
    "publish": "Publikuj",
    "queue": "Kolejkuj",
    "draft": "Wersję roboczą",
    "private": "Post prywatny"
   },
   "clearTagsText": "Usuń tagi"
  },
  "reblogTags": "Rebloguj tagi",
  "removeTag": "Usuń tag",
  "timestamps": {
   "failText": ["Załadunek Timestamp się nie powiodło.", "Ponów"],
   "retryIndex": 1
  },
  "loading": "Ładuję...",
  "error": "Wystąpił błąd. Kiknij, aby odświeżyć.",
  "posts": {
   "text": ["Twój", "post"],
   "photo": ["Twóje", "zdjęcie"],
   "photoset": ["Twój", "zestaw zdjęć"],
   "quote": ["Twój", "cytat"],
   "link": ["Twój", "link"],
   "conversation": ["Twój", "dialog"],
   "audio": ["Twój", "post audio"],
   "video": ["Twój", "klip wideo"],
   "question": ["Twóje", "pytanie"]
  },
  "notifications": {
   "like": ["U", "lubi", "P"],
   "reblog": ["U", "reblogował(a)", "P"],
   "reblogIndex": 1,
   "answer": ["U", "odpowiedział(a) na", "P"],
   "reply": ["U", "skomentował(a)", "P"]
  },
  "replyType": {
   "as": "jako ...",
   "photo": ["jak ", "zdjęcie", ""],
   "photoTitle": "Odpowiedź zdjęcie",
   "text": ["jako ", "tekst", ""],
   "textTitle": "Odpowiedź tekst"
  },
  "shuffle": "Przetasuj kolejkę",
  "deleteConfirm": "Czy na pewno chcesz usunąć ten post?",
  "massDelete": {
   "selectAll": "Zaznacz wszystkie",
   "deselectAll": "Odznacz wszystkie",
   "deleteSelected": "Usunąć wybrane",
   "messagesConfirm": "Liczba wybranych wiadomości: #. Czy na pewno chcesz je usunąć?",
   "messagesError": "Niektóre wiadomości nie mogły zostać usunięte. Spróbuj ponownie później.",
   "postsConfirm": "Liczba wybranych postów: #. Czy na pewno chcesz je usunąć?",
   "postsError": "Niektóre posty nie mogły zostać usunięte. Spróbuj ponownie później.",
   "confirmReplace": {
    "operation": ["-", 1],
    "0": {
     "wiadomości: 1. Czy na pewno chcesz je usunąć?": "wiadomości: 1. Czy na pewno chcesz ją usunąć?",
     "postów: 1. Czy na pewno chcesz je usunąć?": "postów: 1. Czy na pewno chcesz go usunąć?"
    }
   }
  },
  "sorting": {
   "sort": "Sortuj",
   "type": "Typ",
   "user": "Użytkownik",
   "reset": "Resetuj"
  }
 },
 "pt": {
  "warningLink": {
   "link": "Leia a declaração de Missing-E sobre privacidade e segurança",
   "subtext": "Este link adicionado por Missing e"
  },
  "daysLong": [
   "Domingo",
   "Segunda-feira",
   "Terça-feira",
   "Quarta-feira",
   "Quinta-feira",
   "Sexta-feira",
   "Sábado"
  ],
  "daysShort": [
   "Dom",
   "Seg",
   "Ter",
   "Qua",
   "Qui",
   "Sex",
   "Sáb"
  ],
  "monthsLong": [
   "Janeiro",
   "Fevereiro",
   "Março",
   "Abril",
   "Maio",
   "Junho",
   "Julho",
   "Agosto",
   "Setembro",
   "Outubro",
   "Novembro",
   "Dezembro"
  ],
  "monthsShort": [
   "Jan",
   "Fev",
   "Mar",
   "Abr",
   "Mai",
   "Jun",
   "Jul",
   "Ago",
   "Set",
   "Out",
   "Nov",
   "Dez"
  ],
  "update": "Atualização Missing e",
  "postCrushes": "Publicar o seu fraquinhos",
  "sidebar": {
   "posts": "Postagens",
   "followers": "Seguidores",
   "messages": "Mensagens",
   "drafts": "Rascunhos",
   "queue": "Programadas",
   "massEditor": "Editar várias postagens"
  },
  "myBlog": "meu blog",
  "reblog": "reblogar",
  "reblogging": "reblogando...",
  "reblogFailed": "Reblog falhou!",
  "rebloggedText": "rebloguei",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "Salvar como rascunho"
   },
   {
    "item": "queue",
    "text": "Colocar na fila"
   },
   {
    "item": "private",
    "text": "Particular"
   },
   {
    "item": "manual",
    "text": "Reblogar manualmente"
   }
  ],
  "private": "Particular",
  "captionText": "Descrição",
  "tagsText": "Marcadores",
  "twitterText": "Enviar para o Twitter",
  "facebookText": "Enviar para o Facebook",
  "anonymous": "anônimo",
  "askPost": "Perguntar",
  "askPerson": ["Pergunte", "U"],
  "asked": ["U", "perguntou"],
  "reblogAsk": "Reblogar Pergunta",
  "select": "Selecionar",
  "first100": "Primeiros 100",
  "next100": "Próximo 100",
  "postTypeNames": {
   "text": "Texto",
   "photo": "Foto",
   "quote": "Citação",
   "link": "Link",
   "chat": "Chat",
   "audio": "Áudio",
   "video": "Vídeo"
  },
  "reply": "Responder",
  "replying": "Responder...",
  "dashTweaksText": {
   "answer": "resposta",
   "edit": "editar",
   "del": "excluir",
   "reblog": "reblogar",
   "reply": "responder",
   "notes": "notas",
   "queue": "fila",
   "publish": "publicar",
   "experimental": "EXPERIMENTAL",
   "exp": "X"
  },
  "bookmarkVerb": "marcar",
  "bookmarkNoun": "Marcador",
  "bookmarksTitle": "Marcadores",
  "postUnavailable": "Postar Indisponíveis",
  "magnify": "ampliar",
  "postingTweaks": {
   "submitText": {
    "publish": "Criar publicação",
    "queue": "Colocar no fila",
    "draft": "Salvar como rascunho",
    "private": "Salvar como privada"
   },
   "clearTagsText": "Marcas claras"
  },
  "reblogTags": "Reblogar marcador",
  "removeTag": "Remover marcador",
  "timestamps": {
   "failText": ["Falha ao carregar timestamp.", "Tentar novamente"],
   "retryIndex": 1
  },
  "loading": "Carregando...",
  "error": "Ocorreu um erro. Clique para recarregar.",
  "posts": {
   "text": ["sua", "postagem"],
   "photo": ["sua", "foto"],
   "photoset": ["seu", "álbum de fotos"],
   "quote": ["sua", "citação"],
   "link": ["seu", "link"],
   "conversation": ["seu", "chat"],
   "audio": ["sua", "postagem de áudio"],
   "video": ["seu", "vídeo"],
   "question": ["sua", "pergunta"]
  },
  "notifications": {
   "like": ["U", "gostou da", "P"],
   "reblog": ["U", "reblogou", "P"],
   "reblogIndex": 1,
   "answer": ["U", "respondeu a", "P"],
   "reply": ["U", "respondeu a", "P"]
  },
  "postNnotificationChanges": {
   "like": {
    "da seu": "do seu"
   },
   "answer": {
    "a seu": "ao seu"
   },
   "reply": {
    "a seu": "ao seu"
   }
  },
  "replyType": {
   "as": "como ...",
   "photo": ["como ", "foto", ""],
   "photoTitle": "Reposta Foto",
   "text": ["como ", "texto", ""],
   "textTitle": "Resposta Texto"
  },
  "shuffle": "Baralhar a fila",
  "deleteConfirm": "Você tem certeza que quer apagar esta postagem?",
  "massDelete": {
   "selectAll": "Selecionar Todos",
   "deselectAll": "Desselecionar Todos",
   "deleteSelected": "Excluir Selecionados",
   "messagesConfirm": "Tem certeza que deseja excluir as # mensagens selecionadas?",
   "messagesError": "Algumas mensagens não puderam ser removidas. Por favor, tente novamente mais tarde.",
   "postsConfirm": "Tem certeza de que deseja excluir as # publicações selecionadas?",
   "postsError": "Algumas publicações não poderam ser removidas. Por favor, tente novamente mais tarde.",
   "confirmReplace": {
    "operation": ["-", 1],
    "0": {
     "as 1 mensagens selecionadas": "a mensagem selecionada",
     "as 1 publicações selecionadas": "da publicação selecionada"
    }
   }
  },
  "sorting": {
   "sort": "Ordenar",
   "type": "Tipo",
   "user": "Usuário",
   "reset": "Restaurar"
  }
 },
 "ru": {
  "warningLink": {
   "link": "Читайте заявление Missing-E в отношении конфиденциальности и безопасности",
   "subtext": "Эта связь была добавлена ​​Missing e"
  },
  "daysLong": [
   "воскресенье",
   "понедельник",
   "вторник",
   "среда",
   "четверг",
   "пятница",
   "суббота"
  ],
  "daysShort": [
   "вс",
   "пн",
   "вт",
   "ср",
   "чт",
   "пт",
   "сб"
  ],
  "monthsLong": [
   "Январь",
   "Февраль",
   "Март",
   "Апрель",
   "Май",
   "Июнь",
   "Июль",
   "Август",
   "Сентябрь",
   "Октябрь",
   "Ноябрь",
   "Декабрь"
  ],
  "monthsShort": [
   "Янв",
   "Фев",
   "Мар",
   "Апр",
   "Май",
   "Июн",
   "Июл",
   "Авг",
   "Сент",
   "Окт",
   "Ноя",
   "Дек"
  ],
  "update": "Обновите Missing e",
  "postCrushes": "Опубликовать ваши хиты",
  "sidebar": {
   "posts": "Посты",
   "followers": "Читатели",
   "messages": "Сообщения",
   "drafts": "Черновики",
   "queue": "Очередь",
   "massEditor": "Маss Post Editor"
  },
  "myBlog": "мой блог",
  "reblog": "реблог",
  "reblogging": "ребложу...",
  "reblogFailed": "Не удалось поместить запись к вам в блог!",
  "rebloggedText": "реблогнул",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "Сохранить черновик"
   },
   {
    "item": "queue",
    "text": "Добавить в очередь"
   },
   {
    "item": "private",
    "text": "Личное"
   },
   {
    "item": "manual",
    "text": "Реблог вручную"
   }
  ],
  "private": "Личное",
  "captionText": "Подпись",
  "tagsText": "теги",
  "twitterText": "Отправить в Twitter",
  "facebookText": "Отправить в Facebook",
  "anonymous": "анонимный",
  "askPost": "Спросить",
  "askPerson": ["Задать", "U", "вопрос"],
  "asked": ["U", "спросил(a)"],
  "reblogAsk": "Реблог вопрос",
  "select": "Выбрать",
  "first100": "Первые 100",
  "next100": "Следующие 100",
  "postTypeNames": {
   "text": "Текст",
   "photo": "Фото",
   "quote": "Цитата",
   "link": "Ссылка",
   "chat": "Чат",
   "audio": "Аудио",
   "video": "Видео"
  },
  "reply": "Ответить",
  "replying": "Ответ...",
  "dashTweaksText": {
   "answer": "ответить",
   "edit": "изменить",
   "del": "удалить",
   "reblog": "реблог",
   "reply": "ответить",
   "notes": "заметок",
   "queue": "в очередь",
   "publish": "опубликовать",
   "experimental": "ЭКСПЕРИМЕНТАЛЬНЫЙ",
   "exp": "ЭКСП"
  },
  "bookmarkVerb": "Сделать закладку",
  "bookmarkNoun": "Закладка",
  "bookmarksTitle": "Закладки",
  "postUnavailable": "Запись недоступна",
  "magnify": "увеличить",
  "postingTweaks": {
   "submitText": {
    "publish": "Опубликовать пост",
    "queue": "Добавить в очередь",
    "draft": "Сохранить черновик",
    "private": "Сохранить как личное"
   },
   "clearTagsText": "Очистить теги"
  },
  "reblogTags": "Реблог теги",
  "removeTag": "Удалить тег",
  "timestamps": {
   "failText": ["Отметка времени загрузки не удалось.", "Повторить"],
   "retryIndex": 1
  },
  "loading": "Загрузка...",
  "error": "Произошла ошибка. Кликните, чтобы перезагрузить.",
  "posts": {
   "text": ["ваш", "пост"],
   "photo": ["ваше", "фото"],
   "photoset": ["ваш", "фотосет"],
   "quote": ["ваша", "цитата"],
   "link": ["ваша", "ссылка"],
   "conversation": ["ваш", "чат"],
   "audio": ["ваш", "видео"],
   "video": ["ваше", "видео"],
   "question": ["ваш", "вопрос"]
  },
  "notifications": {
   "like": ["U", "понравился", "P"],
   "reblog": ["U", "сделал(а) реблог", "P"],
   "reblogIndex": 1,
   "answer": ["U", "ответил(a) на", "P"],
   "reply": ["U", "ответил(a) на", "P"]
  },
  "notificationChanges": {
   "reblog": {
    "ваше": "вашего",
    "ваш": "вашего",
    "ваша": "вашей",
    "пост": "поста",
    "цитата": "цитаты",
    "ссылка": "ссылки",
    "чат": "чата",
    "аудиопост": "аудиопоста"
   }
  },
  "postNotificationChanges": {
   "like": {
    "понравился ваше": "понравилось ваше",
    "понравилася ваша": "понравилась ваша"
   }
  },
  "replyType": {
   "as": "как...",
   "photo": ["как ", "фото", ""],
   "photoTitle": "Ответить фото",
   "text": ["как ", "текста", ""],
   "textTitle": "Ответить текстом"
  },
  "shuffle": "Смешайте очередь",
  "deleteConfirm": "Действительно удалить этот пост?",
  "massDelete": {
   "selectAll": "Выбрать все",
   "deselectAll": "Отменить выбор",
   "deleteSelected": "Удалить выбранное",
   "messagesConfirm": "Вы уверены, что хотите удалить выбранные # сообщений?",
   "messagesError": "Некоторые сообщения не могут быть удалены. Пожалуйста, попробуйте еще раз позже.",
   "postsConfirm": "Вы уверены, что хотите удалить выбранные # записей?",
   "postsError": "Некоторые записи не могут быть удалены. Пожалуйста, попробуйте ещё раз позже.",
   "confirmReplace": {
    "operation": ["%", 10],
    "1": {
     "сообщений": "сообщение",
     "записей": "запись"
    },
    "2": {
     "сообщений": "сообщения",
     "записей": "записи"
    },
    "3": {
     "сообщений": "сообщения",
     "записей": "записи"
    },
    "4": {
     "сообщений": "сообщения",
     "записей": "записи"
    }
   }
  },
  "sorting": {
   "sort": "Сортировать",
   "type": "тип",
   "user": "пользователь",
   "reset": "Сброс"
  }
 },
 "tr": {
  "warningLink": {
   "link": "Gizlilik ve güvenlik açısından Missing-E ifadesi oku",
   "subtext": "Bu bağlantı Missing e tarafından eklendi"
  },
  "daysLong": [
   "Pazar",
   "Pazartesi",
   "Salı",
   "Çarşamba",
   "Perşembe",
   "Cuma",
   "Cumartesi"
  ],
  "daysShort": [
   "Paz",
   "Pzt",
   "Sal",
   "Çar",
   "Per",
   "Cum",
   "Cmt"
  ],
  "monthsLong": [
   "Ocak",
   "Şubat",
   "Mart",
   "Nisan",
   "Mayıs",
   "Haziran",
   "Temmuz",
   "Ağustos",
   "Eylül",
   "Ekim",
   "Kasım",
   "Aralık"
  ],
  "monthsShort": [
   "Oca",
   "Şub",
   "Mar",
   "Nis",
   "May",
   "Haz",
   "Tem",
   "Ağu",
   "Eyl",
   "Eki",
   "Kas",
   "Ara"
  ],
  "update": "Missing e'u Güncelleme",
  "postCrushes": "Aşkların yayınla",
  "sidebar": {
   "posts": "Gönderiler",
   "followers": "Takipçiler",
   "messages": "Mesajlar",
   "drafts": "Taslaklar",
   "queue": "Sırada",
   "massEditor": "Mass Post Editor"
  },
  "myBlog": "blogum",
  "reblog": "yeniden blogla",
  "reblogging": "yeniden bloglama...",
  "reblogFailed": "Yeniden bloglama başarısız oldu!",
  "rebloggedText": "yeniden blogladı",
  "reblogOptions": [
   {
    "item": "draft",
    "text": "Taslak olarak kaydet"
   },
   {
    "item": "queue",
    "text": "Sıraya koy"
   },
   {
    "item": "private",
    "text": "Özel"
   },
   {
    "item": "manual",
    "text": "Yeniden blogla düzenleyerek"
   }
  ],
  "private": "Özel",
  "captionText": "Etiket",
  "tagsText": "Etiketler",
  "twitterText": "Twitter'a gönder",
  "facebookText": "Facebook'a gönder",
  "anonymous": "anonim",
  "askPost": "Sor",
  "askPerson": ["U", "Sor"],
  "asked": ["U", "sordu"],
  "reblogAsk": "Soru Yeniden Blogla",
  "select": "Seç",
  "first100": "İlk 100",
  "next100": "Sonraki 100",
  "postTypeNames": {
   "text": "Metin",
   "photo": "Fotoğraf",
   "quote": "Alıntı",
   "link": "Bağlantı",
   "chat": "Diyalog",
   "audio": "Ses",
   "video": "Video"
  },
  "reply": "Yorum yap",
  "replying": "Yanıtlanıyor...",
  "dashTweaksText": {
   "answer": "yanıtla",
   "edit": "düzenle",
   "del": "sil",
   "reblog": "yeniden blogla",
   "reply": "yorum yap",
   "notes": "yorum",
   "queue": "sırada",
   "publish": "yayınla",
   "experimental": "DENEME",
   "exp": "X"
  },
  "bookmarkVerb": "kalınan yer imi",
  "bookmarkNoun": "Yer imi",
  "bookmarksTitle": "Yer imleri",
  "postUnavailable": "Gönderi Kullanılamıyor",
  "magnify": "büyüt",
  "postingTweaks": {
   "submitText": {
    "publish": "Gönderi yayınla",
    "queue": "Gönderiyi sıraya koy",
    "draft": "Taslak olarak kaydet",
    "private": "Özel olarak kaydet"
   },
   "clearTagsText": "Etiketleri sil"
  },
  "reblogTags": "Yeniden blogla etiketler",
  "removeTag": "Etiketi kaldır",
  "timestamps": {
   "failText": ["Zaman Damgası yükleme başarısız oldu.", "Yeniden deneyin"],
   "retryIndex": 1
  },
  "loading": "Yüklüyor",
  "error": "Bir hata oluştu! Lütfen yeniden deneyin.",
  "posts": {
   "text": ["gönderini"],
   "photo": ["fotoğrafını"],
   "photoset": ["fotoğraf albümü'nü"],
   "quote": ["alıntın"],
   "link": ["bağlantını"],
   "conversation": ["diyaloğunu"],
   "audio": ["ses gönderini"],
   "video": ["videonu"],
   "question": ["soruya"]
  },
  "notifications": {
   "like": ["U,", "P", "beğendi"],
   "reblog": ["U,", "P", "yeniden blogladı"],
   "reblogIndex": 2,
   "answer": ["U,", "sorduğun", "P", "cevap verdi"],
   "reply": ["U,", "P", "yorum yaptı"]
  },
  "notificationChanges": {
   "reply": {
    "gönderini": "gönderine",
    "fotoğrafını": "fotoğrafına",
    "fotoğraf albümü'nü": "fotoğraf albümüne",
    "alıntın": "alıntına",
    "bağlantını": "bağlantına",
    "diyaloğunu": "diyaloğuna",
    "ses gönderini": "ses gönderine",
    "videonu": "videona"
   }
  },
  "replyType": {
   "as": "gibi ...",
   "photo": ["", "fotoğraf", " olarak"],
   "photoTitle": "Fotoğraf'la Cevapla",
   "text": ["", "metin", " olarak"],
   "textTitle": "Metin'le Cevapla"
  },
  "shuffle": "Sırasını karıştırmak",
  "deleteConfirm": "Bu gönderiyi silmek istediğine emin misin?",
  "massDelete": {
   "selectAll": "Hepsini Seç",
   "deselectAll": "Seçimi Kaldır",
   "deleteSelected": "Seçilenleri Sil",
   "messagesConfirm": "Seçili olan bu # mesajlar silinsin mi?",
   "messagesError": "Üzgünüz bazı mesajlar şu anda silinemiyor. Lütfen daha sonra yeniden deneyin.",
   "postsConfirm": "Seçili olan bu # gönderiler silinsin mi?",
   "postsError": "Üzgünüz bazı gönderiler şu anda silinemiyor. Lütfen daha sonra yeniden deneyin.",
   "confirmReplace": {
    "operation": ["-", 1],
    "0": {
     "mesajlar": "mesajı",
     "gönderiler": "gönderi"
    }
   }
  },
  "sorting": {
   "sort": "Sırala",
   "type": "Tipi",
   "user": "Kullanıcı",
   "reset": "Sıfırla"
  }
 }
};
   
	var module = {
		/**
		 * Credit Missing e... Lifesaver!
		 */
		getTimestampFromTumblrsAnnoyingFormat: buildTimestamp,
		getLocale: getLocale,
		locale: locale
	};
   
   return module;
});
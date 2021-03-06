import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { gui } from '/lib/const';
import { TAPi18n } from 'meteor/tap:i18n';

import { sidebarWidth, sidebarPercentage } from '/imports/ui/modules/menu';
import { showFullName } from '/imports/startup/both/modules/utils';
import { getFlag } from '/imports/ui/templates/components/identity/avatar/avatar';

import './sidebar.html';
import '../../components/collective/collective.js';
import '../../widgets/inbox/inbox.js';

/**
* @summary draws the sidebar if activated
*/
function drawSidebar() {
  if (Session.get('sidebar') === true && $('#menu').css('margin-left') === `-${sidebarPercentage()}%`) {
    Session.set('sidebar', false);
  }
}

function labelName(user) {
  let name = `${showFullName(user.profile.firstName, user.profile.lastName, user.username)} ${getFlag(user.profile, true)}`;
  if (user._id === Meteor.userId()) {
    name += ` <span class='sidebar-tag'>${TAPi18n.__('you')}</span>`;
  }
  return name;
}

/**
* @summary translates db object to a menu ux object
* @param {object} user database user object
*/
function dataToMenu(user) {
  return {
    id: user._id,
    label: labelName(user),
    icon: user.profile.picture,
    iconActivated: false,
    feed: 'user',
    value: true,
    separator: false,
    url: `/peer/${user.username}`,
    selected: false,
  };
}

Template.sidebar.onRendered(() => {
  $('.left').width(`${sidebarPercentage()}%`);

  drawSidebar();

  $(window).resize(() => {
    $('.left').width(`${sidebarPercentage()}%`);
    if (!Session.get('sidebar')) {
      $('#menu').css('margin-left', `${parseInt(0 - sidebarWidth(), 10)}px`);
    } else {
      let newRight = 0;
      if ($(window).width() < gui.MOBILE_MAX_WIDTH) {
        newRight = parseInt(0 - sidebarWidth(), 10);
      }
      $('#content').css('left', sidebarWidth());
      $('#content').css('right', newRight);
    }
  });
});

Template.sidebar.helpers({
  decisions() {
    return Session.get('menuDecisions');
  },
  personal() {
    return Session.get('menuPersonal');
  },
  delegate() {
    return Session.get('menuDelegates');
  },
  member() {
    const members = [];
    const db = Meteor.users.find({}, { sort: { 'profile.firstName': 1 } }).fetch();
    for (const i in db) {
      members.push(dataToMenu(db[i]));
    }
    return _.sortBy(members, (user) => { return user.label; });
  },
  totalMembers() {
    return Meteor.users.find().count();
  },
  totalDelegates() {
    return Session.get('menuDelegates');
  },
});

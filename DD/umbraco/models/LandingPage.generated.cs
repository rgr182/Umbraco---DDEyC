//------------------------------------------------------------------------------
// <auto-generated>
//   This code was generated by a tool.
//
//    Umbraco.ModelsBuilder.Embedded v13.0.3+a0f3c15
//
//   Changes to this file will be lost if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Linq.Expressions;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Infrastructure.ModelsBuilder;
using Umbraco.Cms.Core;
using Umbraco.Extensions;

namespace Umbraco.Cms.Web.Common.PublishedModels
{
	/// <summary>Landing Page</summary>
	[PublishedModel("landingPage")]
	public partial class LandingPage : PublishedContentModel, IFooterProperties, IHeaderProperties, IHomeRedirectButtonProperties, IRichTextFooterRow, IRichTextHeadlineRow, ISearchComboProperties
	{
		// helpers
#pragma warning disable 0109 // new is redundant
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		public new const string ModelTypeAlias = "landingPage";
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		public new const PublishedItemType ModelItemType = PublishedItemType.Content;
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[return: global::System.Diagnostics.CodeAnalysis.MaybeNull]
		public new static IPublishedContentType GetModelContentType(IPublishedSnapshotAccessor publishedSnapshotAccessor)
			=> PublishedModelUtility.GetModelContentType(publishedSnapshotAccessor, ModelItemType, ModelTypeAlias);
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[return: global::System.Diagnostics.CodeAnalysis.MaybeNull]
		public static IPublishedPropertyType GetModelPropertyType<TValue>(IPublishedSnapshotAccessor publishedSnapshotAccessor, Expression<Func<LandingPage, TValue>> selector)
			=> PublishedModelUtility.GetModelPropertyType(GetModelContentType(publishedSnapshotAccessor), selector);
#pragma warning restore 0109

		private IPublishedValueFallback _publishedValueFallback;

		// ctor
		public LandingPage(IPublishedContent content, IPublishedValueFallback publishedValueFallback)
			: base(content, publishedValueFallback)
		{
			_publishedValueFallback = publishedValueFallback;
		}

		// properties

		///<summary>
		/// Embeded Video
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("embededVideo")]
		public virtual global::Umbraco.Cms.Core.Models.Blocks.BlockListItem<global::Umbraco.Cms.Web.Common.PublishedModels.VideoEmbedElement> EmbededVideo => this.Value<global::Umbraco.Cms.Core.Models.Blocks.BlockListItem<global::Umbraco.Cms.Web.Common.PublishedModels.VideoEmbedElement>>(_publishedValueFallback, "embededVideo");

		///<summary>
		/// Image Carousel
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("imageCarousel")]
		public virtual global::Umbraco.Cms.Core.Models.Blocks.BlockListModel ImageCarousel => this.Value<global::Umbraco.Cms.Core.Models.Blocks.BlockListModel>(_publishedValueFallback, "imageCarousel");

		///<summary>
		/// News Carousel
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("newsCarousel")]
		public virtual global::Umbraco.Cms.Core.Models.Blocks.BlockListModel NewsCarousel => this.Value<global::Umbraco.Cms.Core.Models.Blocks.BlockListModel>(_publishedValueFallback, "newsCarousel");

		///<summary>
		/// Rich Text and Images
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("richTextAndImages")]
		public virtual global::Umbraco.Cms.Core.Models.Blocks.BlockListModel RichTextAndImages => this.Value<global::Umbraco.Cms.Core.Models.Blocks.BlockListModel>(_publishedValueFallback, "richTextAndImages");

		///<summary>
		/// footer Items
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("footerItems")]
		public virtual global::Umbraco.Cms.Core.Models.Blocks.BlockListModel FooterItems => global::Umbraco.Cms.Web.Common.PublishedModels.FooterProperties.GetFooterItems(this, _publishedValueFallback);

		///<summary>
		/// footer Social Media Items
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("footerSocialMediaItems")]
		public virtual global::Umbraco.Cms.Core.Models.Blocks.BlockListModel FooterSocialMediaItems => global::Umbraco.Cms.Web.Common.PublishedModels.FooterProperties.GetFooterSocialMediaItems(this, _publishedValueFallback);

		///<summary>
		/// footerTitle: Enter the footer Title
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("footerTitle")]
		public virtual global::Umbraco.Cms.Core.Strings.IHtmlEncodedString FooterTitle => global::Umbraco.Cms.Web.Common.PublishedModels.FooterProperties.GetFooterTitle(this, _publishedValueFallback);

		///<summary>
		/// Bottom Header Image 1
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("bottomHeaderImage1")]
		public virtual global::Umbraco.Cms.Core.Models.MediaWithCrops BottomHeaderImage1 => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetBottomHeaderImage1(this, _publishedValueFallback);

		///<summary>
		/// Bottom Header Image 2
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("bottomHeaderImage2")]
		public virtual global::Umbraco.Cms.Core.Models.MediaWithCrops BottomHeaderImage2 => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetBottomHeaderImage2(this, _publishedValueFallback);

		///<summary>
		/// Header Image Url
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("headerImageUrl")]
		public virtual global::Umbraco.Cms.Core.Models.Link HeaderImageUrl => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetHeaderImageUrl(this, _publishedValueFallback);

		///<summary>
		/// Hide Header Images
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[ImplementPropertyType("hideHeaderImages")]
		public virtual bool HideHeaderImages => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetHideHeaderImages(this, _publishedValueFallback);

		///<summary>
		/// Top Header Image
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("topHeaderImage")]
		public virtual global::Umbraco.Cms.Core.Models.MediaWithCrops TopHeaderImage => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetTopHeaderImage(this, _publishedValueFallback);

		///<summary>
		/// Hide Home Redirect Button
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[ImplementPropertyType("hideHomeRedirectButton")]
		public virtual bool HideHomeRedirectButton => global::Umbraco.Cms.Web.Common.PublishedModels.HomeRedirectButtonProperties.GetHideHomeRedirectButton(this, _publishedValueFallback);

		///<summary>
		/// Home Redirect Button Color
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("homeRedirectButtonColor")]
		public virtual string HomeRedirectButtonColor => global::Umbraco.Cms.Web.Common.PublishedModels.HomeRedirectButtonProperties.GetHomeRedirectButtonColor(this, _publishedValueFallback);

		///<summary>
		/// Home Redirect Button Text
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("homeRedirectButtonText")]
		public virtual string HomeRedirectButtonText => global::Umbraco.Cms.Web.Common.PublishedModels.HomeRedirectButtonProperties.GetHomeRedirectButtonText(this, _publishedValueFallback);

		///<summary>
		/// Home Redirect Button Text color
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("homeRedirectButtonTextColor")]
		public virtual string HomeRedirectButtonTextColor => global::Umbraco.Cms.Web.Common.PublishedModels.HomeRedirectButtonProperties.GetHomeRedirectButtonTextColor(this, _publishedValueFallback);

		///<summary>
		/// Home Redirect Button URL
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("homeRedirectButtonURL")]
		public virtual global::Umbraco.Cms.Core.Models.Link HomeRedirectButtonUrl => global::Umbraco.Cms.Web.Common.PublishedModels.HomeRedirectButtonProperties.GetHomeRedirectButtonUrl(this, _publishedValueFallback);

		///<summary>
		/// Footer Font Size
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[ImplementPropertyType("footerFontSize")]
		public virtual int FooterFontSize => global::Umbraco.Cms.Web.Common.PublishedModels.RichTextFooterRow.GetFooterFontSize(this, _publishedValueFallback);

		///<summary>
		/// Footer Headline: Edit the headline title
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("footerHeadline")]
		public virtual global::Umbraco.Cms.Core.Strings.IHtmlEncodedString FooterHeadline => global::Umbraco.Cms.Web.Common.PublishedModels.RichTextFooterRow.GetFooterHeadline(this, _publishedValueFallback);

		///<summary>
		/// Footer Headline Color
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("footerHeadlineColor")]
		public virtual string FooterHeadlineColor => global::Umbraco.Cms.Web.Common.PublishedModels.RichTextFooterRow.GetFooterHeadlineColor(this, _publishedValueFallback);

		///<summary>
		/// Footer Headline Hide: Select to true if you need to hide the text
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[ImplementPropertyType("footerHeadlineHide")]
		public virtual bool FooterHeadlineHide => global::Umbraco.Cms.Web.Common.PublishedModels.RichTextFooterRow.GetFooterHeadlineHide(this, _publishedValueFallback);

		///<summary>
		/// Edit Text: Edit the headline title
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("editText")]
		public virtual global::Umbraco.Cms.Core.Strings.IHtmlEncodedString EditText => global::Umbraco.Cms.Web.Common.PublishedModels.RichTextHeadlineRow.GetEditText(this, _publishedValueFallback);

		///<summary>
		/// Font Size Editor
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[ImplementPropertyType("fontSizeEditor")]
		public virtual int FontSizeEditor => global::Umbraco.Cms.Web.Common.PublishedModels.RichTextHeadlineRow.GetFontSizeEditor(this, _publishedValueFallback);

		///<summary>
		/// Hide: Select to true if you need to hide the text
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[ImplementPropertyType("hide")]
		public virtual bool Hide => global::Umbraco.Cms.Web.Common.PublishedModels.RichTextHeadlineRow.GetHide(this, _publishedValueFallback);

		///<summary>
		/// Select Color
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("selectColor")]
		public virtual string SelectColor => global::Umbraco.Cms.Web.Common.PublishedModels.RichTextHeadlineRow.GetSelectColor(this, _publishedValueFallback);

		///<summary>
		/// Combo Box 1 Title
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("comboBox1Title")]
		public virtual string ComboBox1Title => global::Umbraco.Cms.Web.Common.PublishedModels.SearchComboProperties.GetComboBox1Title(this, _publishedValueFallback);

		///<summary>
		/// Combo Box 2 Title
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("comboBox2Title")]
		public virtual string ComboBox2Title => global::Umbraco.Cms.Web.Common.PublishedModels.SearchComboProperties.GetComboBox2Title(this, _publishedValueFallback);

		///<summary>
		/// Default Search Combo Text
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("defaultSearchComboText")]
		public virtual string DefaultSearchComboText => global::Umbraco.Cms.Web.Common.PublishedModels.SearchComboProperties.GetDefaultSearchComboText(this, _publishedValueFallback);

		///<summary>
		/// Hide Search Combo Contents
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[ImplementPropertyType("hideSearchComboContents")]
		public virtual bool HideSearchComboContents => global::Umbraco.Cms.Web.Common.PublishedModels.SearchComboProperties.GetHideSearchComboContents(this, _publishedValueFallback);

		///<summary>
		/// Search Combo Contents
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("searchComboContents")]
		public virtual global::Umbraco.Cms.Core.Models.Blocks.BlockListModel SearchComboContents => global::Umbraco.Cms.Web.Common.PublishedModels.SearchComboProperties.GetSearchComboContents(this, _publishedValueFallback);
	}
}

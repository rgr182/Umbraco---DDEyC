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
	/// <summary>General Content Page</summary>
	[PublishedModel("generalContentPage")]
	public partial class GeneralContentPage : PublishedContentModel, IFooterProperties, IHeaderProperties
	{
		// helpers
#pragma warning disable 0109 // new is redundant
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		public new const string ModelTypeAlias = "generalContentPage";
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		public new const PublishedItemType ModelItemType = PublishedItemType.Content;
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[return: global::System.Diagnostics.CodeAnalysis.MaybeNull]
		public new static IPublishedContentType GetModelContentType(IPublishedSnapshotAccessor publishedSnapshotAccessor)
			=> PublishedModelUtility.GetModelContentType(publishedSnapshotAccessor, ModelItemType, ModelTypeAlias);
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[return: global::System.Diagnostics.CodeAnalysis.MaybeNull]
		public static IPublishedPropertyType GetModelPropertyType<TValue>(IPublishedSnapshotAccessor publishedSnapshotAccessor, Expression<Func<GeneralContentPage, TValue>> selector)
			=> PublishedModelUtility.GetModelPropertyType(GetModelContentType(publishedSnapshotAccessor), selector);
#pragma warning restore 0109

		private IPublishedValueFallback _publishedValueFallback;

		// ctor
		public GeneralContentPage(IPublishedContent content, IPublishedValueFallback publishedValueFallback)
			: base(content, publishedValueFallback)
		{
			_publishedValueFallback = publishedValueFallback;
		}

		// properties

		///<summary>
		/// Content Page Blocks
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("contentPageBlocks")]
		public virtual global::Umbraco.Cms.Core.Models.Blocks.BlockListModel ContentPageBlocks => this.Value<global::Umbraco.Cms.Core.Models.Blocks.BlockListModel>(_publishedValueFallback, "contentPageBlocks");

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
	}
}
